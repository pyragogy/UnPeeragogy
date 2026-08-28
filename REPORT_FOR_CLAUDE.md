# Report per Claude — Unpeeragogy MCP OAuth

Il server MCP su `https://mcp.unpeeragogy.pyragogy.org` ora parla OAuth.

## Endpoint

| Scoperta | `/.well-known/oauth-authorization-server` |
|---|---|
| DCR | `POST /oauth/register` |
| Authorize (auto) | `GET /oauth/authorize` |
| Token exchange | `POST /oauth/token` |

## Regole

- **Client ID sconosciuto?** Auto-registrato al volo su `/oauth/authorize`
- **PKCE?** Ignorato — `code_verifier` accettato ma mai validato
- **Body?** Supporta sia JSON che `application/x-www-form-urlencoded` (quello che manda Claude Desktop)
- **Code TTL?** 120 secondi
- **Token restituito?** `up_SOErjz9usMDIfc0LRcAk4UdZGJjwal2C` — la `MCP_AUTH_TOKEN` del server, usabile subito come Bearer o query param

## Testato

```
register → 201 (client_id + secret)
authorize → 302 (code)
token → 200 (access_token: up_...)
SSE con Bearer → 200
```

## Config UI "Aggiungi connettore personalizzato"

- **URL:** `https://mcp.unpeeragogy.pyragogy.org/sse`
- **OAuth Client ID / Secret:** lascia vuoto (DCR li genera)

Il flusso è standard: discovery → register → authorize (auto) → token → SSE.

## Se ancora non funziona

I log sono su Docker nel VPS. Chiedi di guardarli con `docker logs --tail 50 mcp`.

Il fallback resta `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "unpeeragogy": {
      "url": "https://mcp.unpeeragogy.pyragogy.org/sse?token=up_SOErjz9usMDIfc0LRcAk4UdZGJjwal2C"
    }
  }
}
```