# Report OAuth per Claude Desktop — Unpeeragogy MCP Server

## Stato attuale

Il server MCP all'indirizzo `https://mcp.unpeeragogy.pyragogy.org` espone endpoint OAuth 2.0 minimale per la UI "Aggiungi connettore personalizzato" di Claude Desktop. Il flusso completo **funziona**.

## Endpoint OAuth

### Discovery
```
GET /.well-known/oauth-authorization-server

→ 200 OK
{
  "issuer": "https://mcp.unpeeragogy.pyragogy.org",
  "authorization_endpoint": "https://mcp.unpeeragogy.pyragogy.org/oauth/authorize",
  "token_endpoint": "https://mcp.unpeeragogy.pyragogy.org/oauth/token",
  "registration_endpoint": "https://mcp.unpeeragogy.pyragogy.org/oauth/register",
  "token_endpoint_auth_methods_supported": ["client_secret_basic", "client_secret_post", "none"],
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code"],
  "code_challenge_methods_supported": ["S256", "plain"]
}
```

### Dynamic Client Registration
```
POST /oauth/register
Content-Type: application/json

{
  "client_name": "Claude Desktop",
  "redirect_uris": ["http://127.0.0.1:34567/callback", "http://localhost:34567/callback"]
}

→ 201 OK
{
  "client_id": "<uuid>",
  "client_secret": "<uuid>",
  "client_id_issued_at": <unix_timestamp>,
  "client_secret_expires_at": 0,
  "redirect_uris": [...],
  "token_endpoint_auth_method": "client_secret_basic",
  "grant_types": ["authorization_code"],
  "response_types": ["code"]
}
```

**Accetta qualsiasi client.** Nessuna validazione.

### Authorization (auto-approve)
```
GET /oauth/authorize?client_id=<client_id>&redirect_uri=<redirect_uri>&response_type=code&state=<state>

→ 302 Found
Location: <redirect_uri>?code=<uuid>&state=<state>
```

**Auto-approva sempre.** Nessuna interazione utente. Il codice scade dopo 60 secondi.

### Token Exchange
```
POST /oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "<code>",
  "redirect_uri": "<redirect_uri>"
}

→ 200 OK
{
  "access_token": "up_SOErjz9usMDIfc0LRcAk4UdZGJjwal2C",
  "token_type": "bearer",
  "expires_in": 86400,
  "scope": "mcp"
}
```

L'`access_token` è **diretamente la `MCP_AUTH_TOKEN`** del server (quella che l'utente conosce). Il token è statico, non scade mai veramente. Usabile subito per:
- `Authorization: Bearer up_SOErjz9usMDIfc0LRcAk4UdZGJjwal2C`
- Oppure `?token=up_SOErjz9usMDIfc0LRcAk4UdZGJjwal2C`

## Configurazione nella UI "Aggiungi connettore personalizzato"

| Campo | Valore |
|---|---|
| **Nome** | `Unpeeragogy` |
| **URL del server MCP remoto** | `https://mcp.unpeeragogy.pyragogy.org/sse` |
| **OAuth Client ID** | Lascia vuoto — la registrazione dinamica li genera automaticamente |
| **OAuth Client Secret** | Lascia vuoto |

Il flusso è:
1. Claude Desktop scopre OAuth via `/.well-known/oauth-authorization-server`
2. Si registra via `/oauth/register` (ottiene client_id + client_secret)
3. Apre il browser a `/oauth/authorize` → auto-approvato
4. Scambia il code per token via `/oauth/token`
5. Usa il token come Bearer per connettersi a `/sse`

## Alternative se la UI non funziona

### `claude_desktop_config.json`
```json
{
  "mcpServers": {
    "unpeeragogy": {
      "url": "https://mcp.unpeeragogy.pyragogy.org/sse?token=up_SOErjz9usMDIfc0LRcAk4UdZGJjwal2C"
    }
  }
}
```
Chiudi e riapri Claude Desktop. Va in **Impostazioni → Developer → MCP Servers**.

## Testato

| Test | Esito |
|---|---|
| Discovery (locale) | 200 ✅ |
| DCR (locale) | 201 ✅ |
| Authorize (locale) | 302 + code ✅ |
| Token exchange (locale) | 200 + access_token ✅ |
| SSE con Bearer token (locale) | 200 ✅ |
| Flusso completo remoto | 200 ✅ |
| SSE con token remoto | 200 ✅ |

## Schema del codice

- **OAuth endpoints**: `packages/mcp-server/src/lib/oauth.ts`
- **Integrazione**: `packages/mcp-server/src/index.ts` — `routeOAuth()` chiamato PRIMA delle rotte protette
- **Nessun auth richiesto** per le rotte OAuth (ovvio, sono l'auth stesso)