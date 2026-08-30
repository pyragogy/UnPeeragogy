import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import http from "node:http";
import { readFileSync } from "node:fs";

// ─── Content modules ───────────────────────────────────────────
import { listResources, readResource } from "./resources/index.js";
import {
  search,
  compareSlug,
  analyzeSlug,
  calculateTensionIndex,
  injectFriction,
} from "./tools/index.js";
import { getAgentPerturbatorePrompt, getFrictionPrompt } from "./prompts/index.js";
import { hasFriction } from "./lib/friction.js";
import { loadAllEntries } from "./lib/loader.js";
import { routeOAuth } from "./lib/oauth.js";


// ─── Configuration ────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "3001", 10);
const AUTH_TOKEN = process.env.MCP_AUTH_TOKEN;
const FRICTION_MODE = (process.env.MCP_FRICTION_MODE || "soft") as "off" | "soft" | "hard";

// ─── MCP Server Setup ──────────────────────────────────────────
const server = new Server(
  {
    name: "unpeeragogy-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

// ─── Authentication (RFC 6750 Bearer token only) ────────────
function getTokenFromHeader(req: http.IncomingMessage): string | null {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

function checkAuth(req: http.IncomingMessage): boolean {
  if (!AUTH_TOKEN) {
    // Fail-secure: should never reach here — startup exits if unset
    return false;
  }
  return getTokenFromHeader(req) === AUTH_TOKEN;
}

// ─── Apply Friction Filter ─────────────────────────────────────
function applyFrictionFilter(
  toolName: string,
  input: Record<string, unknown>,
  output: string
): string {
  if (FRICTION_MODE === "off") return output;

  // Skip if already contains friction
  if (hasFriction(output)) return output;

  const topic = (input.topic as string) ||
    (input.slug as string) ||
    (input.query as string) ||
    toolName;

  let friction: string | null = null;

  if (toolName === "search") {
    friction = `\n\n*⚡ Friction Note (auto-iniettata): I risultati della ricerca potrebbero non mostrare tutta la tensione sistemica. Prova usare il tool "inject-friction" con topic="${topic}" per un'analisi più profonda.*`;
  } else if (toolName === "compare") {
    friction = `\n\n*⚡ Friction Note: Il confronto mostra solo le due colonne. L'Agente Perturbatore ti invita a chiederti: perché la realtà non segue la teoria?*`;
  } else if (FRICTION_MODE === "hard") {
    friction = `\n\n*⚡ Hard mode: nessuna risposta senza attrito esplicito. Rileggi il contenuto sopra cercando le contraddizioni.*`;
  }

  return friction ? output + friction : output;
}

// ─── Resource Handlers ─────────────────────────────────────────
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const resources = listResources();
  return {
    resources: resources.map((r) => ({
      uri: r.uri,
      name: r.name,
      description: r.description,
      mimeType: r.mimeType,
    })),
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  try {
    const result = readResource(request.params.uri);
    return {
      contents: [
        {
          uri: result.uri,
          text: result.text,
          mimeType: "text/markdown",
        },
      ],
    };
  } catch (err) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      err instanceof Error ? err.message : "Unknown error reading resource"
    );
  }
});

// ─── Tool Handlers ──────────────────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search",
        description:
          "Cerca in tutti i contenuti (teoria e realtà). Usa indicizzazione fuzzy per trovare termini correlati.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Testo da cercare (supporta fuzzy search)",
            },
            maxResults: {
              type: "number",
              description: "Massimo numero di risultati (default: 10)",
              default: 10,
            },
          },
          required: ["query"],
        },
      },
      {
        name: "compare",
        description:
          "Confronta la colonna Teoria (Peeragogy) con la colonna Realtà (Unpeeragogy) per uno slug specifico.",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description: "Slug del capitolo (es. 'cooperation', 'assessment')",
            },
          },
          required: ["slug"],
        },
      },
      {
        name: "analyze",
        description:
          "Analizza uno slug e restituisce i vettori di fallimento, lo scarto teoria/realtà e la struttura.",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description: "Slug del capitolo da analizzare",
            },
          },
          required: ["slug"],
        },
      },
      {
        name: "inject-friction",
        description:
          "Analizza un argomento con attrito strutturale. In modalità 'soft' evidenzia le contraddizioni; in 'hard' forza la decostruzione anche dove sembra non esserci attrito.",
        inputSchema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "Argomento da analizzare",
            },
            mode: {
              type: "string",
              description: "Modalità di attrito: 'soft' (default) o 'hard'",
              enum: ["soft", "hard"],
              default: "soft",
            },
          },
          required: ["topic"],
        },
      },
      {
        name: "tension-index",
        description:
          "Calcola l'indice di tensione sistemica. Se specificato uno slug, analizza la coppia teoria/realtà; altrimenti calcola la media sull'intero corpus.",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description: "Slug opzionale per analizzare un singolo capitolo",
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const input = (args || {}) as Record<string, unknown>;

  try {
    let output: string;

    switch (name) {
      case "search": {
        const query = input.query as string;
        const maxResults = (input.maxResults as number) || 10;
        const results = search(query, maxResults);
        if (results.length === 0) {
          output = `Nessun risultato per "${query}".`;
        } else {
          output = `## Risultati per: "${query}"\n\n`;
          for (const r of results) {
            output += `### ${r.title} (${r.collection})\n`;
            output += `Slug: \`${r.slug}\``;
            if (r.section) output += ` | Sezione: ${r.section}`;
            output += ` | Score: ${(r.score * 100).toFixed(0)}%\n`;
            if (r.description) output += `> ${r.description}\n`;
            output += "\n";
          }
        }
        break;
      }

      case "compare": {
        const slug = input.slug as string;
        output = compareSlug(slug);
        break;
      }

      case "analyze": {
        const slug = input.slug as string;
        output = analyzeSlug(slug);
        break;
      }

      case "inject-friction": {
        const topic = input.topic as string;
        const mode = (input.mode as "soft" | "hard") || "soft";
        output = injectFriction(topic, mode);
        break;
      }

      case "tension-index": {
        const slug = input.slug as string | undefined;
        const result = calculateTensionIndex(slug);
        const tiStr = result.index.toFixed(4);
        output = `## Indice di Tensione\n\n`;
        if (result.slug) output += `Slug: \`${result.slug}\`\n\n`;
        output += `**Indice: ${tiStr}**\n\n`;
        output += `Interpretazione: ${result.interpretation}\n\n`;
        output += `### Scala:\n`;
        output += `- 0.0: Nessuna tensione (possibile consenso facile)\n`;
        output += `- 0.1–0.3: Tensione bassa\n`;
        output += `- 0.3–0.6: Tensione moderata\n`;
        output += `- 0.6–1.0: Tensione alta\n`;
        output += `- 1.0–1.5: Tensione critica\n`;
        output += `- 1.5+: Tensione massima (collasso del pattern)\n`;
        break;
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }

    // Apply friction filter globally
    output = applyFrictionFilter(name, input, output);

    return {
      content: [
        {
          type: "text",
          text: output,
        },
      ],
    };
  } catch (err) {
    if (err instanceof McpError) throw err;
    const message = err instanceof Error ? err.message : "Unknown error";
    throw new McpError(ErrorCode.InternalError, message);
  }
});

// ─── Prompt Handlers ────────────────────────────────────────────
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "agent-perturbatore",
        description:
          "Template dell'Agente Perturbatore — analisi con attrito strutturale",
      },
      {
        name: "friction-analysis",
        description:
          "Analisi con attrito per un argomento specifico. Richiede parametro 'topic'.",
        arguments: [
          {
            name: "topic",
            description: "Argomento da analizzare",
            required: true,
          },
        ],
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "agent-perturbatore":
      return {
        messages: [
          {
            role: "system",
            content: {
              type: "text",
              text: getAgentPerturbatorePrompt(),
            },
          },
        ],
        description:
          "Prompt system per usare l'Agente Perturbatore in qualsiasi conversazione.",
      };

    case "friction-analysis": {
      const topic = args?.topic as string;
      if (!topic) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Missing required parameter: topic"
        );
      }

      // Find matching content
      const entries = loadAllEntries();
      const lower = topic.toLowerCase();
      const matching = entries.filter(
        (e) =>
          e.slug.toLowerCase().includes(lower) ||
          e.frontmatter.title.toLowerCase().includes(lower)
      );
      const theory = matching.find((e) => e.collection === "peeragogy");
      const reality = matching.find((e) => e.collection === "unpeeragogy");

      return {
        messages: [
          {
            role: "system",
            content: {
              type: "text",
              text: getFrictionPrompt(topic, {
                theory: theory?.body,
                reality: reality?.body,
              }),
            },
          },
          {
            role: "user",
            content: {
              type: "text",
              text: `Analizza "${topic}" con attrito strutturale.`,
            },
          },
        ],
        description: `Analisi con attrito per "${topic}".`,
      };
    }

    default:
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Unknown prompt: ${name}`
      );
  }
});

// ─── HTTP Server (SSE Transport) ──────────────────────────────
const transports = new Map<string, SSEServerTransport>();

const httpServer = http.createServer(async (req, res) => {
  // CORS headers — restrict to known origins when Origin is sent
  // (MCP desktop clients don't send Origin; browsers do)
  const allowedOrigins = [
    'https://unpeeragogy.pyragogy.org',
    'http://localhost:4321',
    'http://localhost:3100',
  ];
  const origin = req.headers.origin;
  const corsOrigin = origin && allowedOrigins.includes(origin) ? origin : 'null';
  // If no Origin header (desktop clients), allow all (auth token is still required)
  res.setHeader("Access-Control-Allow-Origin", origin ? corsOrigin : "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse URL pathname (supports query params like ?token=)
  let pathname = "/";
  try {
    pathname = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`).pathname;
  } catch {}

  // ─── OAuth routes (handled BEFORE auth — they ARE auth) ─────
  if (routeOAuth(pathname, req, res)) {
    return;
  }

  // Health check
  if (pathname === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        server: "unpeeragogy-mcp",
        version: "0.1.0",
        frictionMode: FRICTION_MODE,
      })
    );
    return;
  }

  // MCP SSE endpoint
  if (pathname === "/sse" && req.method === "GET") {
    if (!checkAuth(req)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ error: "Unauthorized. Provide MCP_AUTH_TOKEN." })
      );
      return;
    }

    const transport = new SSEServerTransport("/messages", res);
    await server.connect(transport);
    transports.set(transport.sessionId, transport);

    // Clean up when the SSE connection closes
    req.on("close", () => {
      transports.delete(transport.sessionId);
    });
    return;
  }

  // MCP message endpoint (POST)
  if (pathname === "/messages" && req.method === "POST") {
    if (!checkAuth(req)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized." }));
      return;
    }

    // Extract sessionId from query params
    let sessionId: string | null = null;
    try {
      const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
      sessionId = url.searchParams.get('sessionId');
    } catch {}

    if (!sessionId) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Missing sessionId query parameter." }));
      return;
    }

    const transport = transports.get(sessionId);
    if (!transport) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "No active SSE session for this sessionId." }));
      return;
    }

    try {
      await transport.handlePostMessage(req, res);
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: String(err) }));
    }
    return;
  }

  // 404
  res.writeHead(404);
  res.end("Not found");
});

// ─── Start ─────────────────────────────────────────────────────
if (!AUTH_TOKEN) {
  console.error("❌ MCP_AUTH_TOKEN is not set. The server refuses to start without authentication.");
  console.error("   Set the environment variable and restart.");
  process.exit(1);
}

httpServer.listen(PORT, () => {
  console.log(`⚡ Unpeeragogy MCP Server running on port ${PORT}`);
  console.log(`  SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`  Health check: http://localhost:${PORT}/health`);
  console.log(`  Friction mode: ${FRICTION_MODE}`);
  console.log(`  Auth: Bearer token enabled`);
  console.log(`  Resources: ${listResources().length} available`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Shutting down...");
  httpServer.close();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Shutting down...");
  httpServer.close();
  process.exit(0);
});