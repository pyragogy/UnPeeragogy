# MCP Server — Deploy & Verify

> Servizio MCP deployato come docker-compose service su Coolify (pyragogy.org).
> Container **running**, health check passato.

## Stato attuale

| Proprietà | Valore |
|-----------|--------|
| **Service UUID** | `lg5869dbqmfhoggibuap6mvx` |
| **App UUID** | `ix92arlhh0tspdmledsqy99c` |
| **Server** | Pyragogy-Core (`91.99.70.26`) |
| **Progetto** | Unpeeragogy |
| **Port** | `3001` |
| **Build** | Docker da `https://github.com/pyragogy/unpeeragogy.git` |
| **Health** | ✅ `curl http://91.99.70.26:3001/health` → OK |

## Unico passo manuale — Set domain dalla UI Coolify

1. Vai su **Coolify Console** → Projects → **Unpeeragogy**
2. Clicca sul servizio **unpeeragogy-mcp**
3. Vai alla scheda **mcp** (l'applicazione interna)
4. Nel campo **Domains**, aggiungi: `mcp.unpeeragogy.pyragogy.org`
5. **Deploy** dalla UI (o push su `main` innesca il deploy automatico)

Dopo qualche secondo, verifica:

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
a ogni push su `main`:

- Web: `t3l7qmqcs7ay6d836h72joty`
- MCP:  `lg5869dbqmfhoggibuap6mvx`

## Troubleshooting

- **Container exited**: verificare che il Dockerfile `COPY` paths siano corretti per il contesto root del repo
- **Health non risponde**: controllare `docker ps` sul server Pyragogy-Core
- **MCP_AUTH_TOKEN reset**: il server usa `MCP_AUTH_TOKEN` env var — settato in docker-compose environment