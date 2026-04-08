import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { randomBytes } from 'node:crypto';
import {
  buildOutlineAuthorizeUrl,
  computeExpiresAt,
  exchangeAuthorizationCode,
} from './outlineOauthClient.js';
import { getSessionStore, verifyPkce } from './sessionStore.js';

/**
 * Returns the public-facing base URL of this MCP server, used for OAuth
 * metadata, redirects, and resource identifiers. Must be set via
 * MCP_SERVER_PUBLIC_URL in production.
 */
function publicBaseUrl(): string {
  const url = process.env.MCP_SERVER_PUBLIC_URL;
  if (!url) {
    throw new Error('MCP_SERVER_PUBLIC_URL must be set (e.g. https://mcp.example.com)');
  }
  return url.replace(/\/+$/, '');
}

function outlineCallbackUrl(): string {
  return `${publicBaseUrl()}/oauth/callback`;
}

/**
 * The canonical resource identifier for this MCP server (RFC 8707).
 * Clients MUST pass this as `resource` in authorize/token requests per
 * MCP Authorization spec 2025-06-18, and we bind issued tokens to it.
 */
function mcpResourceId(): string {
  return `${publicBaseUrl()}/mcp`;
}

/**
 * Compares two resource URIs per RFC 8707 §2: scheme + host + port + path,
 * case-insensitive host, ignoring trailing slash differences.
 */
function resourceMatches(given: string, expected: string): boolean {
  try {
    const a = new URL(given);
    const b = new URL(expected);
    const normPath = (p: string) => (p.endsWith('/') ? p.slice(0, -1) : p);
    return (
      a.protocol === b.protocol &&
      a.hostname.toLowerCase() === b.hostname.toLowerCase() &&
      (a.port || '') === (b.port || '') &&
      normPath(a.pathname) === normPath(b.pathname)
    );
  } catch {
    return false;
  }
}

function randomId(bytes = 16): string {
  return randomBytes(bytes).toString('base64url');
}

function isValidRedirectUri(uri: string): boolean {
  try {
    const u = new URL(uri);
    // Permit http only for localhost (native MCP clients), https otherwise.
    if (u.protocol === 'https:') return true;
    if (u.protocol === 'http:' && (u.hostname === '127.0.0.1' || u.hostname === 'localhost'))
      return true;
    return false;
  } catch {
    return false;
  }
}

export const oauthRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const store = getSessionStore();

  // ── Protected Resource Metadata (RFC 9728) ─────────────────────────────
  // Tells MCP clients which Authorization Server(s) protect this resource.
  app.get('/.well-known/oauth-protected-resource', async (_req, reply) => {
    const base = publicBaseUrl();
    reply.header('Cache-Control', 'public, max-age=3600');
    return {
      resource: `${base}/mcp`,
      authorization_servers: [base],
      bearer_methods_supported: ['header'],
      resource_documentation: `${base}/`,
    };
  });

  // ── Authorization Server Metadata (RFC 8414) ───────────────────────────
  app.get('/.well-known/oauth-authorization-server', async (_req, reply) => {
    const base = publicBaseUrl();
    reply.header('Cache-Control', 'public, max-age=3600');
    return {
      issuer: base,
      authorization_endpoint: `${base}/oauth/authorize`,
      token_endpoint: `${base}/oauth/token`,
      registration_endpoint: `${base}/oauth/register`,
      revocation_endpoint: `${base}/oauth/revoke`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['none'], // public clients w/ PKCE
      revocation_endpoint_auth_methods_supported: ['none'],
      scopes_supported: (process.env.OUTLINE_OAUTH_SCOPES || 'read write').split(/\s+/),
      // RFC 8707 — MCP clients MUST pass `resource` on authorize/token.
      authorization_response_iss_parameter_supported: true,
    };
  });

  // ── Dynamic Client Registration (RFC 7591) stub ─────────────────────────
  // Outline has no DCR; we pretend to register the MCP client and hand it a
  // stable client_id. We only validate that redirect_uris are sane.
  app.post('/oauth/register', async (request, reply) => {
    const body = (request.body ?? {}) as any;
    const redirectUris: string[] = Array.isArray(body.redirect_uris) ? body.redirect_uris : [];
    if (redirectUris.length === 0 || !redirectUris.every(isValidRedirectUri)) {
      return reply
        .code(400)
        .send({ error: 'invalid_redirect_uri', error_description: 'Provide valid redirect_uris' });
    }
    const clientId = `mcp-${randomId(8)}`;
    store.registerClient({
      clientId,
      clientName: typeof body.client_name === 'string' ? body.client_name : null,
      redirectUris,
    });
    reply.code(201);
    return {
      client_id: clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      redirect_uris: redirectUris,
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    };
  });

  // ── Authorization endpoint ─────────────────────────────────────────────
  // The MCP client starts the flow here with PKCE. We persist the PKCE
  // challenge and redirect the user-agent to Outline's own authorize
  // endpoint, using our Outline OAuth app credentials.
  app.get('/oauth/authorize', async (request, reply) => {
    const q = request.query as Record<string, string | undefined>;
    const {
      response_type,
      client_id,
      redirect_uri,
      state,
      code_challenge,
      code_challenge_method,
      scope,
      resource,
    } = q;

    if (response_type !== 'code') {
      return reply.code(400).send({ error: 'unsupported_response_type' });
    }
    if (!client_id || !redirect_uri || !code_challenge) {
      return reply.code(400).send({ error: 'invalid_request' });
    }
    if (!isValidRedirectUri(redirect_uri)) {
      return reply.code(400).send({ error: 'invalid_redirect_uri' });
    }
    const method = code_challenge_method || 'plain';
    if (method !== 'S256') {
      return reply
        .code(400)
        .send({ error: 'invalid_request', error_description: 'code_challenge_method must be S256' });
    }

    // RFC 8707 — if resource is provided, it must match our MCP resource.
    // MCP Authorization spec 2025-06-18 requires clients to send it.
    if (resource && !resourceMatches(resource, mcpResourceId())) {
      return reply
        .code(400)
        .send({ error: 'invalid_target', error_description: 'Unknown resource' });
    }

    // Validate client (accept on-the-fly if not registered — DCR is best-effort).
    const existing = store.getClient(client_id);
    if (!existing) {
      store.registerClient({ clientId: client_id, clientName: null, redirectUris: [redirect_uri] });
    } else if (!existing.redirectUris.includes(redirect_uri)) {
      return reply.code(400).send({ error: 'invalid_redirect_uri' });
    }

    const internalState = randomId(24);
    store.createFlowState({
      state: internalState,
      codeChallenge: code_challenge,
      codeChallengeMethod: method,
      clientId: client_id,
      clientRedirectUri: redirect_uri,
      clientState: state ?? null,
      scope: scope ?? null,
      resource: resource ?? mcpResourceId(),
    });

    const outlineUrl = buildOutlineAuthorizeUrl({
      redirectUri: outlineCallbackUrl(),
      state: internalState,
      scope,
    });
    return reply.redirect(outlineUrl, 302);
  });

  // ── Callback from Outline ──────────────────────────────────────────────
  // Outline redirects here with ?code & ?state. We exchange the code for an
  // Outline access token, persist it in a session row, then redirect the
  // user-agent back to the MCP client with our own short-lived auth_code.
  app.get('/oauth/callback', async (request, reply) => {
    const q = request.query as Record<string, string | undefined>;
    const { code, state, error } = q;

    if (error) {
      return reply.code(400).send({ error, error_description: q.error_description ?? null });
    }
    if (!code || !state) {
      return reply.code(400).send({ error: 'invalid_request' });
    }

    const flow = store.consumeFlowState(state);
    if (!flow) {
      return reply.code(400).send({ error: 'invalid_state' });
    }

    let tokenRes;
    try {
      tokenRes = await exchangeAuthorizationCode({
        code,
        redirectUri: outlineCallbackUrl(),
      });
    } catch (e: any) {
      request.log.error({ err: e }, 'Outline token exchange failed');
      return reply
        .code(502)
        .send({ error: 'outline_token_exchange_failed', error_description: e.message });
    }

    const session = store.createSession({
      outlineAccessToken: tokenRes.access_token,
      outlineRefreshToken: tokenRes.refresh_token ?? null,
      outlineExpiresAt: computeExpiresAt(tokenRes.expires_in),
      userId: null,
    });

    const authCode = store.createAuthCode({
      sessionId: session.id,
      clientId: flow.clientId,
      redirectUri: flow.clientRedirectUri,
      codeChallenge: flow.codeChallenge,
      codeChallengeMethod: flow.codeChallengeMethod,
      resource: flow.resource,
    });

    const redirect = new URL(flow.clientRedirectUri);
    redirect.searchParams.set('code', authCode);
    if (flow.clientState) redirect.searchParams.set('state', flow.clientState);
    return reply.redirect(redirect.toString(), 302);
  });

  // ── Token endpoint ─────────────────────────────────────────────────────
  // MCP client exchanges its auth_code (+ PKCE verifier) for an MCP access
  // token. Also handles refresh_token grant to rotate MCP tokens.
  app.post('/oauth/token', async (request, reply) => {
    const body = (request.body ?? {}) as Record<string, string | undefined>;
    const grant = body.grant_type;

    if (grant === 'authorization_code') {
      const { code, code_verifier, redirect_uri, client_id, resource } = body;
      if (!code || !code_verifier || !redirect_uri || !client_id) {
        return reply.code(400).send({ error: 'invalid_request' });
      }
      const authCode = store.consumeAuthCode(code);
      if (!authCode) {
        return reply.code(400).send({ error: 'invalid_grant' });
      }
      if (authCode.clientId !== client_id || authCode.redirectUri !== redirect_uri) {
        return reply.code(400).send({ error: 'invalid_grant' });
      }
      if (!verifyPkce(code_verifier, authCode.codeChallenge, authCode.codeChallengeMethod)) {
        return reply.code(400).send({ error: 'invalid_grant', error_description: 'PKCE failed' });
      }
      // RFC 8707 — resource at /token MUST match the one pinned at /authorize.
      if (resource) {
        const expected = authCode.resource ?? mcpResourceId();
        if (!resourceMatches(resource, expected)) {
          return reply.code(400).send({ error: 'invalid_target' });
        }
      }
      // The auth code points at a session row; rotate MCP tokens for it.
      const { mcpAccessToken, mcpRefreshToken } = store.rotateMcpTokens(authCode.sessionId);
      return {
        access_token: mcpAccessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: mcpRefreshToken,
        scope: process.env.OUTLINE_OAUTH_SCOPES || 'read write',
      };
    }

    if (grant === 'refresh_token') {
      const { refresh_token, client_id, resource } = body;
      if (!refresh_token || !client_id) {
        return reply.code(400).send({ error: 'invalid_request' });
      }
      if (resource && !resourceMatches(resource, mcpResourceId())) {
        return reply.code(400).send({ error: 'invalid_target' });
      }
      const session = store.lookupByMcpRefreshToken(refresh_token);
      if (!session) {
        return reply.code(400).send({ error: 'invalid_grant' });
      }
      const { mcpAccessToken, mcpRefreshToken } = store.rotateMcpTokens(session.id);
      return {
        access_token: mcpAccessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: mcpRefreshToken,
      };
    }

    return reply.code(400).send({ error: 'unsupported_grant_type' });
  });

  // ── Token Revocation (RFC 7009) ─────────────────────────────────────────
  // Revoking either the access or refresh token kills the session row.
  app.post('/oauth/revoke', async (request, reply) => {
    const body = (request.body ?? {}) as Record<string, string | undefined>;
    const { token, token_type_hint } = body;
    if (!token) {
      return reply.code(400).send({ error: 'invalid_request' });
    }
    // Try the hinted type first, then fall back. Per RFC 7009 the response
    // is 200 regardless of whether the token was known.
    const tryAccess = () => store.lookupByMcpAccessToken(token);
    const tryRefresh = () => store.lookupByMcpRefreshToken(token);
    const session =
      token_type_hint === 'refresh_token'
        ? (tryRefresh() ?? tryAccess())
        : (tryAccess() ?? tryRefresh());
    if (session) {
      store.deleteSession(session.id);
    }
    reply.code(200).send({});
  });
};
