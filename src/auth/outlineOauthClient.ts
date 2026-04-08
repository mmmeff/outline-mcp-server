import axios from 'axios';

/**
 * Thin client for Outline's OAuth 2.0 token endpoint.
 * Outline supports OAuth 2.0 applications since v0.77; endpoints are
 * located under the same origin as the Outline web app:
 *   GET  {OUTLINE_BASE_URL}/oauth/authorize
 *   POST {OUTLINE_BASE_URL}/oauth/token
 */

export type OutlineTokenResponse = {
  access_token: string;
  token_type: string; // "Bearer"
  expires_in?: number; // seconds
  refresh_token?: string;
  scope?: string;
};

function baseUrl(): string {
  const url = process.env.OUTLINE_BASE_URL;
  if (!url) {
    throw new Error('OUTLINE_BASE_URL must be set (e.g. https://outline.example.com)');
  }
  return url.replace(/\/+$/, '');
}

function clientCreds(): { clientId: string; clientSecret: string } {
  const clientId = process.env.OUTLINE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.OUTLINE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      'OUTLINE_OAUTH_CLIENT_ID and OUTLINE_OAUTH_CLIENT_SECRET must be set — register an OAuth app in your Outline instance first.'
    );
  }
  return { clientId, clientSecret };
}

export function buildOutlineAuthorizeUrl(params: {
  redirectUri: string;
  state: string;
  scope?: string;
}): string {
  const { clientId } = clientCreds();
  const u = new URL(`${baseUrl()}/oauth/authorize`);
  u.searchParams.set('client_id', clientId);
  u.searchParams.set('redirect_uri', params.redirectUri);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('state', params.state);
  const scope = params.scope || process.env.OUTLINE_OAUTH_SCOPES || 'read write';
  u.searchParams.set('scope', scope);
  return u.toString();
}

export async function exchangeAuthorizationCode(params: {
  code: string;
  redirectUri: string;
}): Promise<OutlineTokenResponse> {
  const { clientId, clientSecret } = clientCreds();
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: params.redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const { data } = await axios.post(`${baseUrl()}/oauth/token`, body.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
  });
  return data as OutlineTokenResponse;
}

export async function refreshAccessToken(refreshToken: string): Promise<OutlineTokenResponse> {
  const { clientId, clientSecret } = clientCreds();
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const { data } = await axios.post(`${baseUrl()}/oauth/token`, body.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
  });
  return data as OutlineTokenResponse;
}

export function computeExpiresAt(expiresIn: number | undefined): number | null {
  if (!expiresIn) return null;
  return Math.floor(Date.now() / 1000) + expiresIn;
}
