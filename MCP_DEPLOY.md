# MCP Server — Coolify Setup Guide

> Create the MCP server as a standalone application in the **Unpeeragogy** project of the Coolify Console.

## Step 1 — Create the application

From Coolify Console (`https://console.pyragogy.org`), go to Projects → Unpeeragogy → **+ New Application**

### Configuration:

| Field | Value |
|-------|-------|
| **Name** | `unpeeragogy-mcp` |
| **Repository** | `pyragogy/unpeeragogy` |
| **Branch** | `main` |
| **Build Pack** | `Dockerfile` |
| **Base Directory** | `/` |
| **Dockerfile Location** | `/packages/mcp-server/Dockerfile` |
| **Port(s)** | `3001` |
| **Domain** | `mcp.unpeeragogy.pyragogy.org` |

### Environment variables:

| Variable | Value |
|----------|-------|
| `MCP_AUTH_TOKEN` | (generate a random string — **required**, without it all requests are denied) |
| `MCP_FRICTION_MODE` | `soft` |
| `PORT` | `3001` |

## Step 2 — Get the UUID

After creation, copy the UUID from the app page (e.g. `abc123...`).

## Step 3 — Configure GitHub secret

Go to Settings → Secrets and variables → Actions of the `pyragogy/unpeeragogy` repository and add:

| Secret | Value |
|--------|-------|
| `COOLIFY_MCP_UUID` | The MCP app UUID |

## Step 4 — First manual deploy

From Coolify Console, click **Deploy** on the MCP app.

After deploy, verify with:

```bash
curl https://mcp.unpeeragogy.pyragogy.org/health
```

Expected response:
```json
{"status":"ok","server":"unpeeragogy-mcp","version":"0.1.0","frictionMode":"soft"}
```

## Step 5 — Connect from a client

```bash
npx @pyragogy/mcp-server --setup --token <MCP_AUTH_TOKEN>
```

Or manually configure your MCP client:

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

> **Security**: `Authorization: Bearer` is the only accepted method. Query params are **not supported**.