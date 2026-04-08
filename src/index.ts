#!/usr/bin/env node
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import fastify from 'fastify';
import formbody from '@fastify/formbody';
import cors from '@fastify/cors';
import { getMcpServer } from './utils/getMcpServer.js';
import { RequestContext } from './utils/toolRegistry.js';
import { oauthRoutes } from './auth/oauthRoutes.js';
import { getSessionStore, type Session } from './auth/sessionStore.js';
import { computeExpiresAt, refreshAccessToken } from './auth/outlineOauthClient.js';

const ALLOW_STATIC_KEY = process.env.OUTLINE_MCP_ALLOW_STATIC_KEY === '1';
const OUTLINE_TOKEN_REFRESH_LEEWAY_SEC = 60;

/**
 * Extracts a Bearer token from the Authorization header.
 */
function extractBearerToken(request: any): string | undefined {
  const auth = request.headers?.authorization as string | undefined;
  if (!auth) return undefined;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : undefined;
}

function publicBaseUrl(): string | undefined {
  return process.env.MCP_SERVER_PUBLIC_URL?.replace(/\/+$/, '');
}

/**
 * Sends a 401 with an RFC 9728 WWW-Authenticate header pointing to our
 * protected-resource metadata, which triggers MCP clients to start the
 * OAuth flow.
 */
function sendUnauthorized(reply: any, description: string): void {
  const base = publicBaseUrl();
  const metadata = base
    ? `, resource_metadata="${base}/.well-known/oauth-protected-resource"`
    : '';
  reply.header(
    'WWW-Authenticate',
    `Bearer realm="outline-mcp", error="invalid_token", error_description="${description}"${metadata}`
  );
  reply.code(401).send({
    jsonrpc: '2.0',
    error: { code: -32001, message: description },
    id: null,
  });
}

/**
 * Resolves the Outline access token for this request:
 *  1. If a Bearer token is present, look it up in the session store and
 *     (refresh upstream if needed) return the Outline access token.
 *  2. Otherwise, if the dev/static key fallback is enabled, return the
 *     OUTLINE_API_KEY env var.
 *  3. Otherwise, return null — caller must reply 401.
 */
async function resolveOutlineToken(
  request: any
): Promise<{ token: string; session?: Session } | null> {
  const bearer = extractBearerToken(request);

  if (bearer) {
    const store = getSessionStore();
    const session = store.lookupByMcpAccessToken(bearer);
    if (!session) return null;

    // Refresh Outline access token if near expiry.
    const now = Math.floor(Date.now() / 1000);
    if (
      session.outlineExpiresAt !== null &&
      session.outlineExpiresAt - OUTLINE_TOKEN_REFRESH_LEEWAY_SEC < now &&
      session.outlineRefreshToken
    ) {
      try {
        const res = await refreshAccessToken(session.outlineRefreshToken);
        store.updateOutlineTokens(
          session.id,
          res.access_token,
          res.refresh_token ?? session.outlineRefreshToken,
          computeExpiresAt(res.expires_in)
        );
        session.outlineAccessToken = res.access_token;
      } catch (err) {
        request.log?.error?.({ err }, 'Outline refresh failed — dropping session');
        store.deleteSession(session.id);
        return null;
      }
    }

    store.touchSession(session.id);
    return { token: session.outlineAccessToken, session };
  }

  if (ALLOW_STATIC_KEY && process.env.OUTLINE_API_KEY) {
    return { token: process.env.OUTLINE_API_KEY };
  }

  return null;
}

// HTTP mode - default behavior
const app = fastify({ logger: { level: process.env.LOG_LEVEL || 'info' } });

// Parse application/x-www-form-urlencoded bodies for the OAuth token endpoint.
await app.register(formbody);

// CORS — required for browser-based MCP clients (claude.ai, MCP Inspector).
// Allow all MCP + OAuth endpoints to be called cross-origin, with the
// Authorization header and the mcp-protocol-version / mcp-session-id headers
// exposed and allowed.
const defaultAllowedOrigins = [
  'https://claude.ai',
  'https://claude.com',
  'https://app.claude.ai',
  'https://inspector.modelcontextprotocol.io',
];
const extraOrigins = (process.env.MCP_CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = [...defaultAllowedOrigins, ...extraOrigins];
await app.register(cors, {
  origin: (origin, cb) => {
    // Allow same-origin / non-browser (no Origin header)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    // Allow any localhost origin (dev tools, inspectors)
    try {
      const u = new URL(origin);
      if (u.hostname === '127.0.0.1' || u.hostname === 'localhost') return cb(null, true);
    } catch {
      /* ignore */
    }
    return cb(null, false);
  },
  credentials: false,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'mcp-protocol-version',
    'mcp-session-id',
    'Accept',
    'Last-Event-ID',
  ],
  exposedHeaders: ['mcp-session-id', 'WWW-Authenticate'],
  maxAge: 600,
});

// Mount OAuth authorization server + protected resource metadata.
await app.register(oauthRoutes);

/**
 * Shared Streamable-HTTP handler for POST, GET, and DELETE on /mcp.
 * Streamable HTTP spec: client MAY open a GET stream for server-initiated
 * messages, POST for JSON-RPC requests, DELETE for session termination.
 */
async function handleMcpRequest(request: any, reply: any, hasBody: boolean): Promise<void> {
  try {
    const resolved = await resolveOutlineToken(request);
    if (!resolved) {
      return sendUnauthorized(reply, 'Missing or invalid access token');
    }
    RequestContext.getInstance().setApiKey(resolved.token);

    const mcpServer = await getMcpServer();
    const httpTransport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    reply.raw.on('close', () => {
      httpTransport.close();
      mcpServer.close();
      RequestContext.resetInstance();
    });
    await mcpServer.connect(httpTransport);
    await httpTransport.handleRequest(
      request.raw,
      reply.raw,
      hasBody ? request.body : undefined
    );
  } catch (error: any) {
    request.log.error({ err: error }, 'Error in /mcp endpoint');
    if (!reply.sent) {
      reply.code(500).send({
        jsonrpc: '2.0',
        error: { code: -32603, message: error.message || 'Internal server error' },
        id: null,
      });
    }
  }
}

// Streamable HTTP transport — all three verbs go to the same transport.
app.post('/mcp', (request, reply) => handleMcpRequest(request, reply, true));
app.get('/mcp', (request, reply) => handleMcpRequest(request, reply, false));
app.delete('/mcp', (request, reply) => handleMcpRequest(request, reply, false));

// Legacy SSE endpoint for older clients (single-client only).
let sseTransport: SSEServerTransport | null = null;
app.get('/sse', async (request, reply) => {
  try {
    const resolved = await resolveOutlineToken(request);
    if (!resolved) {
      return sendUnauthorized(reply, 'Missing or invalid access token');
    }
    RequestContext.getInstance().setApiKey(resolved.token);

    const mcpServer = await getMcpServer();
    if (!sseTransport) {
      sseTransport = new SSEServerTransport('/messages', reply.raw);
      await mcpServer.connect(sseTransport);
    }
  } catch (error: any) {
    request.log.error({ err: error }, 'Error in /sse endpoint');
    if (!reply.sent) {
      reply.code(500).send({
        jsonrpc: '2.0',
        error: { code: -32603, message: error.message || 'Internal server error' },
        id: null,
      });
    }
  }
});

app.post('/messages', async (request, reply) => {
  try {
    const resolved = await resolveOutlineToken(request);
    if (!resolved) {
      return sendUnauthorized(reply, 'Missing or invalid access token');
    }
    RequestContext.getInstance().setApiKey(resolved.token);

    if (!sseTransport) {
      reply.code(400).send('No transport found');
      return;
    }
    await sseTransport.handlePostMessage(request.raw, reply.raw, request.body);
  } catch (error: any) {
    request.log.error({ err: error }, 'Error in /messages endpoint');
    reply.code(500).send(error.message || 'Internal server error');
  }
});

const PORT = process.env.OUTLINE_MCP_PORT ? parseInt(process.env.OUTLINE_MCP_PORT, 10) : 6060;
const HOST = process.env.OUTLINE_MCP_HOST || '127.0.0.1';
app.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  const publicUrl = publicBaseUrl() || `http://${HOST}:${PORT}`;
  app.log.info(`Outline MCP Server listening on ${address}`);
  app.log.info(`Public URL: ${publicUrl}`);
  app.log.info(`MCP endpoint: ${publicUrl}/mcp`);
  app.log.info(
    `Protected-resource metadata: ${publicUrl}/.well-known/oauth-protected-resource`
  );
  if (ALLOW_STATIC_KEY) {
    app.log.warn(
      'OUTLINE_MCP_ALLOW_STATIC_KEY=1 — requests without Bearer token will fall back to OUTLINE_API_KEY. Do NOT use in production.'
    );
  }
});
