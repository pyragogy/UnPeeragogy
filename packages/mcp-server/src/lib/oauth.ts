/**
 * oauth.ts — OAuth 2.0 minimale per MCP Dynamic Client Registration.
 *
 * Claude Desktop richiede OAuth per i server remoti nella UI "Aggiungi connettore".
 * Questo modulo implementa il minimo necessario:
 *   - /.well-known/oauth-authorization-server  (discovery)
 *   - /register                                  (DCR)
 *   - /authorize                                 (auto-approve)
 *   - /token                                     (scambia code per MCP_AUTH_TOKEN)
 *
 * Tutti i client sono accettati, tutte le autorizzazioni sono automatiche.
 * Il token restituito è la MCP_AUTH_TOKEN del server.
 */

import crypto from "node:crypto";
import http from "node:http";
import { URL } from "node:url";

interface ClientRecord {
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
  client_name?: string;
  [key: string]: unknown;
}

interface AuthCode {
  code: string;
  client_id: string;
  redirect_uri: string;
  expires_at: number;
}

const SERVER_BASE = process.env.MCP_PUBLIC_URL || "https://mcp.unpeeragogy.pyragogy.org";
const REGISTERED_CLIENTS = new Map<string, ClientRecord>();
const AUTH_CODES = new Map<string, AuthCode>();

// Helper per parse JSON o form-urlencoded body
function parseRequestBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 65536) {
        reject(new Error("Body too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      const ct = req.headers["content-type"] || "";
      if (ct.includes("application/json")) {
        try {
          const parsed = JSON.parse(body);
          resolve(typeof parsed === "object" && parsed !== null ? parsed : {});
        } catch {
          reject(new Error("Invalid JSON"));
        }
      } else {
        // Form-urlencoded parse
        const params: Record<string, string> = {};
        for (const part of body.split("&")) {
          const eq = part.indexOf("=");
          if (eq === -1) {
            params[decodeURIComponent(part)] = "";
          } else {
            params[decodeURIComponent(part.slice(0, eq))] = decodeURIComponent(part.slice(eq + 1));
          }
        }
        resolve(params);
      }
    });
  });
}

// Helper per scrivere JSON response
function jsonResponse(res: http.ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// ─── Discovery ────────────────────────────────────────────────
export function handleWellKnownOAuth(req: http.IncomingMessage, res: http.ServerResponse) {
  jsonResponse(res, 200, {
    issuer: SERVER_BASE,
    authorization_endpoint: `${SERVER_BASE}/oauth/authorize`,
    token_endpoint: `${SERVER_BASE}/oauth/token`,
    registration_endpoint: `${SERVER_BASE}/oauth/register`,
    token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post", "none"],
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    code_challenge_methods_supported: ["S256", "plain"],
  });
}

// ─── Dynamic Client Registration ──────────────────────────────
export async function handleRegister(req: http.IncomingMessage, res: http.ServerResponse) {
  try {
    const body = await parseRequestBody(req);
    if (!body || typeof body !== "object") {
      return jsonResponse(res, 400, { error: "invalid_client_metadata" });
    }

    const client_id = crypto.randomUUID();
    const client_secret = crypto.randomUUID();

    let redirect_uris: string[] = [];
    const raw = body.redirect_uris;
    if (typeof raw === "string") {
      try { redirect_uris = JSON.parse(raw); } catch {}
    } else if (Array.isArray(raw)) {
      redirect_uris = raw.map(String);
    }
    if (!Array.isArray(redirect_uris)) redirect_uris = [];

    // Also allow fallback via single redirect_uri string
    if (redirect_uris.length === 0 && typeof body.redirect_uri === "string") {
      redirect_uris = [body.redirect_uri];
    }

    const record: ClientRecord = {
      client_id,
      client_secret,
      redirect_uris,
      client_name: (body.client_name as string) || undefined,
      token_endpoint_auth_method: "client_secret_basic",
    };

    REGISTERED_CLIENTS.set(client_id, record);

    const now = Math.floor(Date.now() / 1000);
    jsonResponse(res, 201, {
      client_id,
      client_secret,
      client_id_issued_at: now,
      client_secret_expires_at: 0,
      redirect_uris,
      token_endpoint_auth_method: "client_secret_basic",
      grant_types: ["authorization_code"],
      response_types: ["code"],
      client_name: record.client_name,
    });
  } catch (err) {
    console.error(`[oauth] /register error: ${err instanceof Error ? err.message : String(err)}`);
    jsonResponse(res, 400, { error: "invalid_client_metadata" });
  }
}

// ─── Authorization (auto-approve) ─────────────────────────────
export function handleAuthorize(req: http.IncomingMessage, res: http.ServerResponse) {
  const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
  const client_id = url.searchParams.get("client_id");
  const redirect_uri = url.searchParams.get("redirect_uri");
  const response_type = url.searchParams.get("response_type");
  const state = url.searchParams.get("state");

  if (!client_id || !redirect_uri || response_type !== "code") {
    res.writeHead(400, { "Content-Type": "text/html" });
    return res.end("<html><body><h1>400 Bad Request</h1><p>Missing client_id, redirect_uri, or invalid response_type.</p></body></html>");
  }

  // Auto-register unregistered clients on the fly
  if (!REGISTERED_CLIENTS.has(client_id)) {
    REGISTERED_CLIENTS.set(client_id, {
      client_id,
      client_secret: crypto.randomUUID(),
      redirect_uris: [redirect_uri],
    });
  }

  const client = REGISTERED_CLIENTS.get(client_id)!;

  // Auto-approve: generate code and redirect
  const code = crypto.randomUUID();
  const expires_at = Date.now() + 120000; // 2 minutes — Claude needs time
  AUTH_CODES.set(code, { code, client_id, redirect_uri, expires_at });

  const location = `${redirect_uri}?code=${code}${state ? `&state=${state}` : ""}`;
  // Also emit HTML with auto-redirect in case the browser blocks JS
  res.writeHead(302, { Location: location });
  res.end();
}

// ─── Token Exchange ───────────────────────────────────────────
export async function handleToken(req: http.IncomingMessage, res: http.ServerResponse) {
  try {
    const params = await parseRequestBody(req);

    const grant_type = String(params.grant_type || "");
    const code = String(params.code || "");

    // Accept any code_verifier — skip PKCE validation entirely
    // This is intentional: auto-approve server, PKCE adds no security here
    const _code_verifier = params.code_verifier;

    if (grant_type !== "authorization_code") {
      return jsonResponse(res, 400, { error: "unsupported_grant_type" });
    }

    if (!code) {
      return jsonResponse(res, 400, { error: "invalid_request", error_description: "Missing code" });
    }

    // Validate auth code
    const authCode = AUTH_CODES.get(code);
    if (!authCode) {
      return jsonResponse(res, 400, { error: "invalid_grant", error_description: "Invalid code" });
    }

    if (Date.now() > authCode.expires_at) {
      AUTH_CODES.delete(code);
      return jsonResponse(res, 400, { error: "invalid_grant", error_description: "Code expired" });
    }

    // One-time use
    AUTH_CODES.delete(code);

    // Return the MCP_AUTH_TOKEN as the access token
    const mcpToken = process.env.MCP_AUTH_TOKEN;
    if (!mcpToken) {
      return jsonResponse(res, 500, { error: "server_error", error_description: "MCP_AUTH_TOKEN not configured" });
    }

    jsonResponse(res, 200, {
      access_token: mcpToken,
      token_type: "bearer",
      expires_in: 86400,
      scope: "mcp",
    });
  } catch (err) {
    console.error(`[oauth] /token error: ${err instanceof Error ? err.message : String(err)}`);
    jsonResponse(res, 400, { error: "invalid_request", error_description: err instanceof Error ? err.message : "Unknown error" });
  }
}

// ─── Router (chiamato dal server principale) ──────────────────
export function routeOAuth(pathname: string, req: http.IncomingMessage, res: http.ServerResponse): boolean {
  if (pathname === "/.well-known/oauth-authorization-server" && req.method === "GET") {
    handleWellKnownOAuth(req, res);
    return true;
  }

  if (pathname === "/oauth/register" && req.method === "POST") {
    handleRegister(req, res);
    return true;
  }

  if (pathname === "/oauth/authorize" && req.method === "GET") {
    handleAuthorize(req, res);
    return true;
  }

  if (pathname === "/oauth/token" && req.method === "POST") {
    handleToken(req, res);
    return true;
  }

  return false; // not an OAuth route
}