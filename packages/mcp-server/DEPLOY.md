# MCP Server — Deploy & Verify

> Servizio MCP deployato su Coolify (pyragogy.org) nel progetto Unpeeragogy.
> Container **running**, health check passato.

## Stato attuale

| Proprietà | Valore |
|-----------|--------|
| **Server** | Pyragogy-Core (`91.99.70.26`) |
| **Progetto** | Unpeeragogy (UUID: `k148lm5dloro147dpqnlpd91`) |
| **Port** | `3001` |
| **Health** | ✅ `curl http://91.99.70.26:3001/health` → OK |

## ⚠️ Passo manuale — Creare l'app MCP dalla UI Coolify

Il server MCP è deployato come docker-compose service. Per assegnare il dominio
`mcp.unpeeragogy.pyragogy.org` serve creare un'applicazione **standalone** dalla UI.

Dalla **Coolify Console** → **Projects** → **Unpeeragogy** → **+ Nuova Applicazione**:

| Campo | Valore |
|-------|--------|
| **Nome** | `unpeeragogy-mcp` |
| **Repository** | `pyragogy/unpeeragogy` |
| **Branch** | `main` |
| **Build Pack** | `Dockerfile` |
| **Base Directory** | `/` |
| **Dockerfile Location** | `/packages/mcp-server/Dockerfile` |
| **Port** | `3001` |
| **Domain** | `mcp.unpeeragogy.pyragogy.org` |

Dopo la creazione, clicca **Deploy**. Tra ~3 minuti:

```bash
curl https://mcp.unpeeragogy.pyragogy.org/health
# → {"status":"ok","server":"unpeeragogy-mcp","version":"0.1.0","frictionMode":"soft"}
```

## Verifica completa del MCP Server

### 1. Risorse MCP (list + read)
```bash
# Lista risorse
curl -s "http://91.99.70.26:3001/mcp/list" \
  -H "Authorization: Bearer $MCP_AUTH_TOKEN"

# Leggi risorsa per vettore di fallimento
curl -s "http://91.99.70.26:3001/mcp/read?uri=unpeeragogy://failure/misunderstanding_power" \
  -H "Authorization: Bearer $MCP_AUTH_TOKEN"
```

### 2. Tool MCP (via POST JSON)
```bash
# Search
curl -s -X POST "http://91.99.70.26:3001/mcp/tool" \
  -H "Authorization: Bearer $MCP_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tool":"search","params":{"query":"peeragogy","maxResults":5}}'

# Inject Friction
curl -s -X POST "http://91.99.70.26:3001/mcp/tool" \
  -H "Authorization: Bearer $MCP_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tool":"injectFriction","params":{"topic":"moderation","mode":"hard"}}'

# Tension Index
curl -s -X POST "http://91.99.70.26:3001/mcp/tool" \
  -H "Authorization: Bearer $MCP_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tool":"calculateTensionIndex","params":{}}'
```

### 3. Connessione da client MCP (Claude Desktop / Cline)

```json
{
  "mcpServers": {
    "unpeeragogy": {
      "url": "https://mcp.unpeeragogy.pyragogy.org/mcp/sse",
      "headers": {
        "Authorization": "Bearer <MCP_AUTH_TOKEN>"
      }
    }
  }
}
```

## Deploy automatico

Il workflow `.github/workflows/deploy.yml` deploya **entrambi** i servizi (web + MCP)
a ogni push su `main` (UUID della nuova applicazione MCP da aggiornare nel secret).

## Troubleshooting

- **Container exited**: Il Dockerfile `COPY` paths deve corrispondere al contesto root del repo
- **Health non risponde**: Il container builda ma esce subito → controllare i log da Coolify UI
- **MCP_AUTH_TOKEN**: Va settato come variabile d'ambiente nell'app Coolify