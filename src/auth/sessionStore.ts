import Database from 'better-sqlite3';
import { randomBytes, createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type Session = {
  id: string;
  mcpAccessToken: string;
  mcpRefreshToken: string;
  outlineAccessToken: string;
  outlineRefreshToken: string | null;
  outlineExpiresAt: number | null; // unix seconds
  userId: string | null;
  createdAt: number;
  lastUsedAt: number;
};

export type FlowState = {
  state: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  clientId: string;
  clientRedirectUri: string;
  clientState: string | null;
  scope: string | null;
  resource: string | null;
  createdAt: number;
};

export type AuthCode = {
  code: string;
  sessionId: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  resource: string | null;
  expiresAt: number;
};

const FLOW_STATE_TTL_SEC = 10 * 60; // 10 min
const AUTH_CODE_TTL_SEC = 5 * 60; // 5 min
const MCP_ACCESS_TOKEN_TTL_SEC = 60 * 60; // 1 h — rotated via refresh

function now(): number {
  return Math.floor(Date.now() / 1000);
}

function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export class SessionStore {
  private db: Database.Database;

  constructor(dbPath: string) {
    mkdirSync(dirname(dbPath), { recursive: true });
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.migrate();
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS oauth_flow_state (
        state TEXT PRIMARY KEY,
        code_challenge TEXT NOT NULL,
        code_challenge_method TEXT NOT NULL,
        client_id TEXT NOT NULL,
        client_redirect_uri TEXT NOT NULL,
        client_state TEXT,
        scope TEXT,
        resource TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        mcp_access_token TEXT NOT NULL UNIQUE,
        mcp_refresh_token TEXT NOT NULL UNIQUE,
        outline_access_token TEXT NOT NULL,
        outline_refresh_token TEXT,
        outline_expires_at INTEGER,
        user_id TEXT,
        created_at INTEGER NOT NULL,
        last_used_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_access ON sessions(mcp_access_token);
      CREATE INDEX IF NOT EXISTS idx_sessions_refresh ON sessions(mcp_refresh_token);

      CREATE TABLE IF NOT EXISTS auth_codes (
        code TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        client_id TEXT NOT NULL,
        redirect_uri TEXT NOT NULL,
        code_challenge TEXT NOT NULL,
        code_challenge_method TEXT NOT NULL,
        resource TEXT,
        expires_at INTEGER NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS oauth_clients (
        client_id TEXT PRIMARY KEY,
        client_name TEXT,
        redirect_uris TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
  }

  // ── OAuth flow state (in-flight authorize requests) ─────────────────────
  createFlowState(params: Omit<FlowState, 'createdAt'>): void {
    this.db
      .prepare(
        `INSERT INTO oauth_flow_state (state, code_challenge, code_challenge_method, client_id, client_redirect_uri, client_state, scope, resource, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        params.state,
        params.codeChallenge,
        params.codeChallengeMethod,
        params.clientId,
        params.clientRedirectUri,
        params.clientState,
        params.scope,
        params.resource,
        now()
      );
  }

  consumeFlowState(state: string): FlowState | null {
    const row = this.db
      .prepare(`SELECT * FROM oauth_flow_state WHERE state = ?`)
      .get(state) as any;
    if (!row) return null;
    this.db.prepare(`DELETE FROM oauth_flow_state WHERE state = ?`).run(state);
    if (row.created_at + FLOW_STATE_TTL_SEC < now()) return null;
    return {
      state: row.state,
      codeChallenge: row.code_challenge,
      codeChallengeMethod: row.code_challenge_method,
      clientId: row.client_id,
      clientRedirectUri: row.client_redirect_uri,
      clientState: row.client_state,
      scope: row.scope,
      resource: row.resource ?? null,
      createdAt: row.created_at,
    };
  }

  // ── Sessions ────────────────────────────────────────────────────────────
  createSession(params: {
    outlineAccessToken: string;
    outlineRefreshToken: string | null;
    outlineExpiresAt: number | null;
    userId: string | null;
  }): Session {
    const session: Session = {
      id: randomToken(16),
      mcpAccessToken: randomToken(32),
      mcpRefreshToken: randomToken(32),
      outlineAccessToken: params.outlineAccessToken,
      outlineRefreshToken: params.outlineRefreshToken,
      outlineExpiresAt: params.outlineExpiresAt,
      userId: params.userId,
      createdAt: now(),
      lastUsedAt: now(),
    };
    this.db
      .prepare(
        `INSERT INTO sessions (id, mcp_access_token, mcp_refresh_token, outline_access_token, outline_refresh_token, outline_expires_at, user_id, created_at, last_used_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        session.id,
        session.mcpAccessToken,
        session.mcpRefreshToken,
        session.outlineAccessToken,
        session.outlineRefreshToken,
        session.outlineExpiresAt,
        session.userId,
        session.createdAt,
        session.lastUsedAt
      );
    return session;
  }

  private rowToSession(row: any): Session {
    return {
      id: row.id,
      mcpAccessToken: row.mcp_access_token,
      mcpRefreshToken: row.mcp_refresh_token,
      outlineAccessToken: row.outline_access_token,
      outlineRefreshToken: row.outline_refresh_token,
      outlineExpiresAt: row.outline_expires_at,
      userId: row.user_id,
      createdAt: row.created_at,
      lastUsedAt: row.last_used_at,
    };
  }

  lookupByMcpAccessToken(token: string): Session | null {
    const row = this.db
      .prepare(`SELECT * FROM sessions WHERE mcp_access_token = ?`)
      .get(token) as any;
    return row ? this.rowToSession(row) : null;
  }

  lookupByMcpRefreshToken(token: string): Session | null {
    const row = this.db
      .prepare(`SELECT * FROM sessions WHERE mcp_refresh_token = ?`)
      .get(token) as any;
    return row ? this.rowToSession(row) : null;
  }

  touchSession(sessionId: string): void {
    this.db
      .prepare(`UPDATE sessions SET last_used_at = ? WHERE id = ?`)
      .run(now(), sessionId);
  }

  updateOutlineTokens(
    sessionId: string,
    outlineAccessToken: string,
    outlineRefreshToken: string | null,
    outlineExpiresAt: number | null
  ): void {
    this.db
      .prepare(
        `UPDATE sessions SET outline_access_token = ?, outline_refresh_token = ?, outline_expires_at = ?, last_used_at = ? WHERE id = ?`
      )
      .run(outlineAccessToken, outlineRefreshToken, outlineExpiresAt, now(), sessionId);
  }

  rotateMcpTokens(sessionId: string): { mcpAccessToken: string; mcpRefreshToken: string } {
    const mcpAccessToken = randomToken(32);
    const mcpRefreshToken = randomToken(32);
    this.db
      .prepare(
        `UPDATE sessions SET mcp_access_token = ?, mcp_refresh_token = ?, last_used_at = ? WHERE id = ?`
      )
      .run(mcpAccessToken, mcpRefreshToken, now(), sessionId);
    return { mcpAccessToken, mcpRefreshToken };
  }

  deleteSession(sessionId: string): void {
    this.db.prepare(`DELETE FROM sessions WHERE id = ?`).run(sessionId);
  }

  // ── Auth codes (our own PKCE codes issued to MCP clients) ───────────────
  createAuthCode(params: {
    sessionId: string;
    clientId: string;
    redirectUri: string;
    codeChallenge: string;
    codeChallengeMethod: string;
    resource: string | null;
  }): string {
    const code = randomToken(32);
    this.db
      .prepare(
        `INSERT INTO auth_codes (code, session_id, client_id, redirect_uri, code_challenge, code_challenge_method, resource, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        code,
        params.sessionId,
        params.clientId,
        params.redirectUri,
        params.codeChallenge,
        params.codeChallengeMethod,
        params.resource,
        now() + AUTH_CODE_TTL_SEC
      );
    return code;
  }

  consumeAuthCode(code: string): AuthCode | null {
    const row = this.db.prepare(`SELECT * FROM auth_codes WHERE code = ?`).get(code) as any;
    if (!row) return null;
    this.db.prepare(`DELETE FROM auth_codes WHERE code = ?`).run(code);
    if (row.expires_at < now()) return null;
    return {
      code: row.code,
      sessionId: row.session_id,
      clientId: row.client_id,
      redirectUri: row.redirect_uri,
      codeChallenge: row.code_challenge,
      codeChallengeMethod: row.code_challenge_method,
      resource: row.resource ?? null,
      expiresAt: row.expires_at,
    };
  }

  // ── OAuth clients (DCR-registered) ──────────────────────────────────────
  registerClient(params: {
    clientId: string;
    clientName: string | null;
    redirectUris: string[];
  }): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO oauth_clients (client_id, client_name, redirect_uris, created_at) VALUES (?, ?, ?, ?)`
      )
      .run(params.clientId, params.clientName, JSON.stringify(params.redirectUris), now());
  }

  getClient(
    clientId: string
  ): { clientId: string; clientName: string | null; redirectUris: string[] } | null {
    const row = this.db
      .prepare(`SELECT * FROM oauth_clients WHERE client_id = ?`)
      .get(clientId) as any;
    if (!row) return null;
    return {
      clientId: row.client_id,
      clientName: row.client_name,
      redirectUris: JSON.parse(row.redirect_uris),
    };
  }

  // ── Housekeeping ────────────────────────────────────────────────────────
  gc(): void {
    const t = now();
    this.db.prepare(`DELETE FROM oauth_flow_state WHERE created_at + ? < ?`).run(FLOW_STATE_TTL_SEC, t);
    this.db.prepare(`DELETE FROM auth_codes WHERE expires_at < ?`).run(t);
  }
}

/**
 * PKCE verifier check: S256 hash of verifier (base64url) must equal challenge.
 */
export function verifyPkce(
  verifier: string,
  challenge: string,
  method: string
): boolean {
  if (method === 'plain') return verifier === challenge;
  if (method === 'S256') {
    const hash = createHash('sha256').update(verifier).digest('base64url');
    return hash === challenge;
  }
  return false;
}

let _store: SessionStore | null = null;
export function getSessionStore(): SessionStore {
  if (!_store) {
    const dbPath = process.env.SESSION_DB_PATH || './data/sessions.db';
    _store = new SessionStore(dbPath);
  }
  return _store;
}
