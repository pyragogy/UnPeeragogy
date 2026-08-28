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

// Helper per parse JSON body
function parseJSONBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 65536) {
        reject(new Error("Body too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve(null);
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
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
    const body = (await parseJSONBody(req)) as Record<string, unknown> | null;
    if (!body || typeof body !== "object") {
      return jsonResponse(res, 400, { error: "invalid_client_metadata" });
    }

    const client_id = crypto.randomUUID();
    const client_secret = crypto.randomUUID();

    const redirect_uris = (body.redirect_uris as string[]) || [];
    if (!Array.isArray(redirect_uris)) {
      return jsonResponse(res, 400, { error: "invalid_redirect_uri" });
    }

    const record: ClientRecord = {
      client_id,
      client_secret,
      redirect_uris,
      client_name: (body.client_name as string) || undefined,
      token_endpoint_auth_method: "client_secret_basic",
      // Store any extra fields
      ...(body as Record<string, unknown>),
    };

    REGISTERED_CLIENTS.set(client_id, record);

    const now = Math.floor(Date.now() / 1000);
    jsonResponse(res, 201, {
      client_id,
      client_secret,
      client_id_issued_at: now,
      client_secret_expires_at: 0, // never expires
      redirect_uris,
      token_endpoint_auth_method: "client_secret_basic",
      grant_types: ["authorization_code"],
      response_types: ["code"],
      client_name: record.client_name,
    });
  } catch (err) {
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

  // Validate client
  const client = REGISTERED_CLIENTS.get(client_id);
  if (!client) {
    return res.end(`<html><body><h1>Unauthorized Client</h1><p>Client ID "${client_id}" not registered. Register first via /oauth/register.</p></body></html>`);
  }

  // Validate redirect_uri
  const allowed = client.redirect_uris.some((u) => redirect_uri.startsWith(u));
  if (!allowed) {
    return res.end(`<html><body><h1>Invalid Redirect URI</h1><p>${redirect_uri} not in registered redirect URIs.</p></body></html>`);
  }

  // Auto-approve: generate code and redirect
  const code = crypto.randomUUID();
  const expires_at = Date.now() + 60000; // 1 minute
  AUTH_CODES.set(code, { code, client_id, redirect_uri, expires_at });

  const location = `${redirect_uri}?code=${code}${state ? `&state=${state}` : ""}`;
  res.writeHead(302, { Location: location });
  res.end();
}

// ─── Token Exchange ───────────────────────────────────────────
export async function handleToken(req: http.IncomingMessage, res: http.ServerResponse) {
  try {
    const body = (await parseJSONBody(req)) as Record<string, unknown> | null;

    // Support both POST body and query params
    const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
    const grant_type = (body?.grant_type as string) || url.searchParams.get("grant_type");
    const code = (body?.code as string) || url.searchParams.get("code");
    const redirect_uri = (body?.redirect_uri as string) || url.searchParams.get("redirect_uri");
    const client_id = (body?.client_id as string) || url.searchParams.get("client_id");
    const client_secret = (body?.client_secret as string) || url.searchParams.get("client_secret");

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

    // Validate redirect_uri
    if (authCode.redirect_uri !== redirect_uri) {
      return jsonResponse(res, 400, { error: "invalid_grant", error_description: "Redirect URI mismatch" });
    }

    // Return the MCP_AUTH_TOKEN as the access token
    const mcpToken = process.env.MCP_AUTH_TOKEN;
    if (!mcpToken) {
      return jsonResponse(res, 500, { error: "server_error", error_description: "MCP_AUTH_TOKEN not configured" });
    }

    jsonResponse(res, 200, {
      access_token: mcpToken,
      token_type: "bearer",
      expires_in: 86400, // 24 hours — refresh not implemented but token is static
      scope: "mcp",
    });
  } catch (err) {
    jsonResponse(res, 400, { error: "invalid_request" });
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