# MCP Server — Deploy & Management

> Administration guide for the MCP server on Coolify. Covers deployment, configuration,
> maintenance, and troubleshooting for developers.

The MCP server exposes the entire Unpeeragogy corpus (theory + reality + failure vectors)
as resources and tools, queryable by any AI client via the MCP protocol.

---

## Repository

- **Source**: `packages/mcp-server/` in the `pyragogy/unpeeragogy` repo
- **Auto-deploy**: GitHub Action `.github/workflows/deploy-mcp.yml` on push to `main`
  that touches `packages/mcp-server/**` or `src/content/**`
- **Manual trigger**: Coolify Console → Projects → Unpeeragogy → App `unpeeragogy-mcp` → Deploy

---

## Stack

| Component | Version |
|-----------|---------|
| Runtime | Node.js 22 (Alpine) |
| MCP SDK | `@modelcontextprotocol/sdk` 1.x |
| Build | TypeScript (`tsc`) |
| Container | Docker multi-stage (build + runtime) |
| Hosting | Coolify (Pyragogy self-hosted) |
| Domain | `mcp.unpeeragogy.pyragogy.org` |
| Internal port | `3001` |

---

## Coolify Configuration

### Creating the app

Coolify Console → Projects → Unpeeragogy → **+ New Application**

| Field | Value |
|-------|--------|
| **Name** | `unpeeragogy-mcp` |
| **Repository** | `pyragogy/unpeeragogy` |
| **Branch** | `main` |
| **Build Pack** | `Dockerfile` |
| **Base Directory** | `/` |
| **Dockerfile Location** | `/packages/mcp-server/Dockerfile` |
| **Port(s)** | `3001` |
| **Domain** | `mcp.unpeeragogy.pyragogy.org` |

### Environment variables

| Variable | Value | Required | Description |
|-----------|--------|-------------|-------------|
| `MCP_AUTH_TOKEN` | (random string) | ✅ **Yes** | Shared token for client authentication. Without it, all requests return 401. |
| `MCP_FRICTION_MODE` | `soft` | No | `off` / `soft` / `hard`. Controls automatic friction injection in responses. |
| `PORT` | `3001` | No | Port the server listens on. Coolify maps it to the container port. |
| `NODE_ENV` | `production` | No | Set automatically in the Dockerfile. |
| `CONTENT_ROOT` | `/app/content` | No | Path to MDX files in the container. Mounted as read-only volume. |

> **Note**: `HETZNER_API_KEY` was present in earlier versions for the live Perturbator agent.
> It has been removed because the `agent-perturbatore` tool now falls back to **static analysis**
> based on the corpus. To re-enable: add the variable with a token from https://experiments.hetzner.com.

### UUID and GitHub Secret

After creation, copy the app UUID from the app page (e.g., `abc123...`).
Add it as a secret in the GitHub repository:

- Settings → Secrets and variables → Actions → **New repository secret**
- **Name**: `COOLIFY_MCP_UUID`
- **Value**: the copied UUID

### Security Headers (Coolify Proxy)

If the server is behind a reverse proxy (Coolify default), configure these headers
in the **Proxy** tab of the app:

| Header | Value | Reason |
|--------|--------|--------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Enforce HTTPS for 2 years |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Do not propagate URL paths |

---

## Build & Deploy

### Package structure

```
packages/mcp-server/
├── Dockerfile              # Multi-stage build
├── package.json            # type: module
├── tsconfig.json
├── .env.example            # Template for local variables
├── src/
│   ├── index.ts            # Entrypoint: SSE + HTTP server + tool/prompt/resource registration
│   ├── resources/index.ts  # 90+ URI resources (failure vectors, slug, prompt)
│   ├── tools/index.ts      # 9 MCP tools (see below)
│   ├── prompts/index.ts    # System prompt template
│   └── lib/
│       ├── loader.ts       # MDX loader from content collections
│       ├── friction.ts     # Structural friction middleware
│       └── perturbatore.ts # Perturbator agent (static fallback)
```

### Local build (for development)

```bash
cd /home/coder/project/unpeeragogy/packages/mcp-server
npm install
npm run build   # npx tsc
```

The `tsc` command compiles `src/` into `dist/`. Zero errors is a prerequisite for deployment.

### Docker Build

The `Dockerfile` has two stages:
1. **build**: install dependencies, compile TypeScript
2. **runtime**: copy only `dist/`, `node_modules/`, and `src/content/` (MDX files)

MDX content is copied from the repo (not mounted from an external volume), making
the deployment atomic: no dependency on persistent volumes.

### CI/CD Pipeline

On push to `main` that touches `packages/mcp-server/**` or `src/content/**`:

1. GitHub Action `deploy-mcp.yml` triggers
2. POST call to Coolify API with UUID and API token
3. Coolify pulls new code, builds the Docker image, restarts the container
4. Server is ready in 30-60 seconds

---

## Server: Endpoint & Behaviour

### Health check

```bash
curl https://mcp.unpeeragogy.pyragogy.org/health
```

Expected response (HTTP 200):
```json
{"status":"ok","server":"unpeeragogy-mcp","version":"0.1.0","frictionMode":"soft"}
```

### SSE (Server-Sent Events) — main endpoint

```
https://mcp.unpeeragogy.pyragogy.org/sse
```

All MCP communications go through a single SSE endpoint.
The client establishes an SSE connection and sends requests via `POST /messages?sessionId=<id>`.

### Authentication

The server only accepts **`Authorization: Bearer`** HTTP headers.
Query params (e.g., `?token=...`) are **not** supported for security reasons.

```
Authorization: Bearer <MCP_AUTH_TOKEN>
```

Without a valid token: HTTP 401 `{"error":"Unauthorized."}`

---

## The 9 MCP Tools

| Name | Input | Output | Description |
|------|-------|--------|-------------|
| `search` | `query`, `maxResults?` | Ranked results with slug, title, section, score | Full-text fuzzy search across the entire corpus (MiniSearch). Title 3x, descriptions/tags 2x boost. |
| `compare` | `slug` | Theory + Reality columns side-by-side | Reads the twin MDX files (peeragogy/{slug}.mdx + unpeeragogy/{slug}.mdx) and presents them as dual-column. |
| `analyze` | `slug` | Failure vectors, tags, tension, structure | Structural extraction: theory/reality gap, unshared vectors, word count. |
| `agent-perturbatore` | `topic`, `mode?` | Static or live critical analysis | **Perturbator**: native critical voice. Static fallback if HETZNER_API_KEY is not configured. |
| `inject-friction` | `topic`, `mode?` (`soft`/`hard`) | Forced structural friction | Injects systematic contradiction into any topic. `soft` highlights, `hard` deconstructs. |
| `tension-index` | `slug?` | Numeric index 0–2.0 + interpretation scale | Systemic tension: corpus average or single pair. Scale: 0=alignment, 2.0=max incompatibility. |
| **`map-failure-graph`** 🆕 | `query?`, `vector?`, `minWeight?` | JSON graph + analytical markdown | **Tension-weighted knowledge graph**: nodes (slug), edges (shared vectors). Filterable by full-text query, specific vector, minimum tension. Output ready for d3-force. |
| **`suggest-field-report`** 🆕 | `text` | Pre-compiled YAML draft + detected vectors | From free-form descriptive text: detects failure vectors via keyword matching, selects template, produces YAML ready to paste into a GitHub Discussion. |
| **`gap-analysis`** 🆕 | _(no input)_ | Epistemic gaps map + priorities | Full corpus scan: orphan slugs (reality without theory or vice versa), uncovered vectors, low-tension areas. Prioritised recommendations for new field reports. |

### Typical Workflows

**Exploration**: `search` → `compare` → `analyze` → `tension-index`

**Contribution**: `suggest-field-report` → (copy YAML to GitHub Discussion) → `gap-analysis` (after report is approved)

**Systemic audit**: `gap-analysis` → `map-failure-graph` → `tension-index` (no slug)

**Critical writing**: `agent-perturbatore` → `inject-friction`

---

## Client Setup (for end users)

> This section is for users who want to connect Claude Desktop, pi, or other clients.
> If you are the admin, provide these instructions when someone requests a token.

### Prerequisite: request a token

The server requires authentication. Write to **info@pyragogy.org** specifying:
- Which client you plan to use (Claude Desktop, pi, Cline, VS Code, other)
- What you need it for (research, contribution, audit)

You will receive a token to use as `MCP_AUTH_TOKEN`.

> **Never commit the token to GitHub. Never share it in public chats.**
> It is a shared secret between you and the server.

### Automatic setup

```bash
npx @pyragogy/mcp-server --setup --token <MCP_AUTH_TOKEN>
```

This automatically configures both Claude Desktop (`claude_desktop_config.json`)
and pi (`~/.pi/config.yaml`), then restarts Claude Desktop.

### Manual setup

Edit `~/.config/Claude/claude_desktop_config.json` (Claude Desktop)
or your MCP client's config file:

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

### Verification

```bash
curl -s https://mcp.unpeeragogy.pyragogy.org/health \
  -H "Authorization: Bearer <MCP_AUTH_TOKEN>"
```

If it responds `{"status":"ok"...}` → it works.

Then ask your AI client: *"List all available tools"*
You should see 9 tools.

---

## Local Development

To work on the server without deploying:

```bash
cd /home/coder/project/unpeeragogy/packages/mcp-server

# Start in dev mode (hot-reload)
npm run dev   # tsx watch src/index.ts

# Build + start
npm run build && node dist/index.js
```

The local server loads content from the repo root (`../../src/content/`).
To test with real data, make sure the structure is present.

### Local environment variables

Create a `.env` file (gitignored) or pass them directly:

```bash
PORT=3099 \
MCP_AUTH_TOKEN="test-token-up_" \
MCP_FRICTION_MODE=soft \
node dist/index.js
```

The server starts on the specified port (default: 3001, in dev: 3099).

### MCP client test

```bash
node -e "
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const transport = new SSEClientTransport(
  new URL('http://localhost:3099/sse'),
  { eventSourceInit: { headers: { Authorization: 'Bearer test-token-up_' } },
    requestInit: { headers: { Authorization: 'Bearer test-token-up_' } } }
);
const client = new Client({ name: 'test', version: '0.1.0' });
await client.connect(transport);
const tools = await client.listTools();
console.log('Tools:', tools.tools.map(t => t.name).join(', '));
await client.close();
"
```

---

## Troubleshooting

### Server not responding

- Check that the Coolify container is running
- Check logs in Coolify (Deployments tab → last deployment → **Logs**)
- Try `curl https://mcp.unpeeragogy.pyragogy.org/health` without headers — must return 200

### Claude Desktop shows `"tools": []`

Most likely cause: **incorrect token or URL configuration**.

1. Verify that `MCP_AUTH_TOKEN` matches the token in the client config
2. Verify you're using `Authorization: Bearer` in **headers**, not query params
3. Restart Claude Desktop after changing the config
4. If using a remote URL, check that the CDN/proxy is not blocking content

If nothing works, connect Claude to the local server (`http://localhost:3099/sse`)
to isolate the problem.

### `"error":"Unauthorized."`

The token does not match or was not passed. Check:
- The `MCP_AUTH_TOKEN` variable in Coolify
- The `claude_desktop_config.json` file (valid JSON format?)
- HTTP headers (capitalisation: `Authorization`, not `authorization`)

### TypeScript build fails

```bash
cd /home/coder/project/unpeeragogy/packages/mcp-server
npm run build
```

Common errors:
- Unescaped backticks inside template literals (use `\`\`\`` instead of `` ``` ``)
- Missing imports from `@modelcontextprotocol/sdk`
- Wrong type in tool definitions

### Automatic deployment not starting

- Did the push touch `packages/mcp-server/**` or `src/content/**`?
- Does the `COOLIFY_MCP_UUID` secret exist on GitHub?
- Does the `COOLIFY_API_TOKEN` secret exist on GitHub? (needed to authenticate the Coolify API call)
- Check [GitHub Actions](https://github.com/pyragogy/UnPeeragogy/actions) for errors

---

## Maintenance

### Updating content collections

MDX files in `src/content/` are copied into the container on every deploy.
To update the data served by the server:

1. Edit or add files in `src/content/{peeragogy,unpeeragogy}/`
2. Commit and push to `main`
3. Auto-deploy rebuilds the container with the new files

### Adding a new tool

1. Implement the function in `src/tools/index.ts`
2. Add the definition in `ListToolsRequestSchema` in `src/index.ts`
3. Add the switch case in `CallToolRequestSchema` in `src/index.ts`
4. Build (`npm run build`) and test
5. Update documentation (this file + site pages)
6. Commit and push

---

## References

- [MCP SDK](https://github.com/modelcontextprotocol/sdk) — protocol
- [Coolify](https://coolify.io) — hosting
- [MCP user documentation →](https://unpeeragogy.pyragogy.org/mcp/)
- [PROJECT_MCP_DESIGN.md](./PROJECT_MCP_DESIGN.md) — original design & roadmap