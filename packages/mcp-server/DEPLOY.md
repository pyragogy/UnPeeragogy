# MCP Server — Deploy & Verify

> MCP service deployed on Coolify (pyragogy.org) under the Unpeeragogy project.
> Container **running**, health check passed.

## Current Status

| Property | Value |
|----------|-------|
| **Server** | Pyragogy-Core (`91.99.70.26`) |
| **Project** | Unpeeragogy (UUID: `k148lm5dloro147dpqnlpd91`) |
| **Port** | `3001` |
| **Health** | ✅ `curl http://91.99.70.26:3001/health` → OK |

## ⚠️ Manual step — Create MCP app from Coolify UI

The MCP server is deployed as a docker-compose service. To assign the domain
`mcp.unpeeragogy.pyragogy.org`, you need to create a **standalone** application from the UI.

From **Coolify Console** → **Projects** → **Unpeeragogy** → **+ New Application**:

| Field | Value |
|-------|-------|
| **Name** | `unpeeragogy-mcp` |
| **Repository** | `pyragogy/unpeeragogy` |
| **Branch** | `main` |
| **Build Pack** | `Dockerfile` |
| **Base Directory** | `/` |
| **Dockerfile Location** | `/packages/mcp-server/Dockerfile` |
| **Port** | `3001` |
| **Domain** | `mcp.unpeeragogy.pyragogy.org` |

After creation, click **Deploy**. In ~3 minutes:

```bash
curl https://mcp.unpeeragogy.pyragogy.org/health
# → {"status":"ok","server":"unpeeragogy-mcp","version":"0.1.0","frictionMode":"soft"}
```

## Verify MCP Server

### 1. Resources (list + read)
```bash
# List resources (use Authorization header)
curl -s -H "Authorization: Bearer $MCP_AUTH_TOKEN" \
  "https://mcp.unpeeragogy.pyragogy.org/mcp/list"

# Read a specific failure vector
curl -s -H "Authorization: Bearer $MCP_AUTH_TOKEN" \
  "https://mcp.unpeeragogy.pyragogy.org/mcp/read?uri=unpeeragogy://failure/misunderstanding_power"
```

### 2. Tools (POST JSON)
```bash
# Search
curl -s -X POST "https://mcp.unpeeragogy.pyragogy.org/mcp/tool" \
  -H "Authorization: Bearer $MCP_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tool":"search","params":{"query":"coordination","maxResults":5}}'

# Inject Friction
curl -s -X POST "https://mcp.unpeeragogy.pyragogy.org/mcp/tool" \
  -H "Authorization: Bearer $MCP_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tool":"inject-friction","params":{"topic":"moderation","mode":"hard"}}'

# Tension Index
curl -s -X POST "https://mcp.unpeeragogy.pyragogy.org/mcp/tool" \
  -H "Authorization: Bearer $MCP_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tool":"tension-index","params":{}}'
```

> **Security note**: prefer the `Authorization: Bearer` header over query params (`?token=`).
> Query params leak to proxy/server logs. The query param fallback exists for backwards compatibility only.

### 3. Connect from MCP client (one command)

```bash
npx @pyragogy/mcp-server --setup --token <MCP_AUTH_TOKEN>
```

This configures both Claude Desktop and pi automatically. Or manually:

```json
{
  "mcpServers": {
    "unpeeragogy": {
      "url": "https://mcp.unpeeragogy.pyragogy.org/sse",
      "headers": {
        "Authorization": "Bearer <MCP_AUTH_TOKEN>"
      }
    }
  }
}
```

## Automatic Deploy

The workflow `.github/workflows/deploy.yml` deploys **both** services (web + MCP)
on every push to `main` (the MCP app UUID must be set in the GitHub secret).

## Troubleshooting

- **Container exited**: Dockerfile `COPY` paths must match the repository root context
- **Health not responding**: Container builds but exits immediately → check logs in Coolify UI
- **Setup script not found**: make sure you're running `npx @pyragogy/mcp-server` (published package), not from the monorepo directly

## 🔐 Authentication: MCP_AUTH_TOKEN

The MCP server protects all endpoints. This is **mandatory** — without it, all requests are denied.

### Admin setup (one time)

1. Generate a token:
   ```bash
   node -e "const c=require('crypto');console.log('up_'+c.randomBytes(24).toString('base64url').slice(0,32))"
   ```
2. Coolify → **Projects → Unpeeragogy → unpeeragogy-mcp → Environment Variables**:
   - Add `MCP_AUTH_TOKEN` = generated token
3. **Redeploy**

### For clients (one command)

```bash
npx @pyragogy/mcp-server --setup --token <MCP_AUTH_TOKEN>
```

Configures Claude Desktop and pi. Flags:
- `--claude` — Claude Desktop only
- `--pi` — pi (coding agent) only
- `--server-url` — custom URL (default: `https://mcp.unpeeragogy.pyragogy.org`)

### Requesting a token

Write to Fabrizio via email: `info&#x40;pyragogy.org`
The token is sent via private email. **Never commit it to GitHub.**