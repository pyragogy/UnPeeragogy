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
  agentPerturbatore,
  isPerturbatoreAvailable,
  mapFailureGraph,
  formatGraphAsMarkdown,
  suggestFieldReport,
  formatSuggestedReport,
  analyzeGaps,
  formatGapAnalysis,
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
    friction = `\n\n*⚡ Friction Note (auto-injected): Search results may not show all systemic tension. Try using the "inject-friction" tool with topic="${topic}" for deeper analysis.*`;
  } else if (toolName === "compare") {
    friction = `\n\n*⚡ Friction Note: The comparison only shows the two columns. The Perturbator invites you to ask: why does reality not follow theory?*`;
  } else if (FRICTION_MODE === "hard") {
    friction = `\n\n*⚡ Hard mode: no response without explicit friction. Re-read the content above looking for contradictions.*`;
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
          "Search across all content (theory and reality). Uses fuzzy indexing to find related terms.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Text to search (supports fuzzy search)",
            },
            maxResults: {
              type: "number",
              description: "Max results (default: 10)",
              default: 10,
            },
          },
          required: ["query"],
        },
      },
      {
        name: "compare",
        description:
          "Compare the Theory (Peeragogy) column with the Reality (Unpeeragogy) column for a specific slug.",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description: "Chapter slug (e.g. 'cooperation', 'assessment')",
            },
          },
          required: ["slug"],
        },
      },
      {
        name: "analyze",
        description:
          "Analyze a slug and return failure vectors, theory/reality gap, and structure.",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description: "Slug to analyze",
            },
          },
          required: ["slug"],
        },
      },
      {
        name: "agent-perturbatore",
        description:
          "Agent Perturbatore — generates structural friction analysis against the corpus. Uses static corpus analysis (fallback from Hetzner GLM-5.2). Latency: instant.",
        inputSchema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "Topic, field report or pattern to analyze",
            },
            mode: {
              type: "string",
              description: "Friction intensity: 'soft', 'hard' (default), 'max' (verbose)",
              enum: ["soft", "hard", "max"],
              default: "hard",
            },
          },
          required: ["topic"],
        },
      },
      {
        name: "inject-friction",
        description:
          "Analyze a topic with structural friction (keyword-based). In 'soft' mode highlights contradictions; in 'hard' forces deconstruction even where no friction seems present.",
        inputSchema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "Topic to analyze",
            },
            mode: {
              type: "string",
              description: "Friction mode: 'soft' (default) or 'hard'",
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
          "Calculate the systemic tension index. If a slug is specified, analyzes the theory/reality pair; otherwise calculates the average across the entire corpus.",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description: "Optional slug for single chapter analysis",
            },
          },
        },
      },
      {
        name: "map-failure-graph",
        description:
          "SUPER-TOOL: tension-weighted knowledge graph. Builds a navigable graph of patterns and failure vectors, with edges weighted by shared tension. Options: query (filter by text), vector (filter by vector), minWeight (edge threshold). Output: markdown + structured JSON for d3-force.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Filter graph to nodes matching this query (slug, title, vectors, section) + 1-hop expansion",
            },
            vector: {
              type: "string",
              description: "Filter graph to only nodes with THIS failure vector",
            },
            minWeight: {
              type: "number",
              description: "Minimum shared edge weight (default: 1)",
              default: 1,
            },
          },
        },
      },
      {
        name: "suggest-field-report",
        description:
          "SUPER-TOOL: generates a pre-filled field report draft from free text. Auto-detects failure vectors, estimates tension_index, suggests template (share-your-story or structural-analysis), and produces pre-filled YAML.",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "Free text: describe an experience, doubt, or observation about a peeragogy pattern",
            },
          },
          required: ["text"],
        },
      },
      {
        name: "gap-analysis",
        description:
          "SUPER-TOOL: maps epistemic gaps in the corpus. Scans all content and identifies: orphan slugs (theory-only or reality-only), vectors not covered by field reports, low-tension areas (possible false consensus), and produces a priority-ranked list of recommendations for new contributions.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Normalise tool names: some clients (Claude Desktop/Code) prefix with
// "ServerName:" (e.g. "Unpeeragogy:tension-index"). Strip the namespace
// prefix before the switch.
function normalizeToolName(name: string): string {
  const idx = name.lastIndexOf(":");
  return idx >= 0 ? name.slice(idx + 1) : name;
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const rawName = request.params.name;
  const name = normalizeToolName(rawName);
  const { arguments: args } = request.params;
  const input = (args || {}) as Record<string, unknown>;
  try {
    let output: string;

    switch (name) {
      case "search": {
        const query = input.query as string;
        const maxResults = (input.maxResults as number) || 10;
        const results = search(query, maxResults);
        if (results.length === 0) {
          output = `No results for "${query}".`;
        } else {
          output = `## Search results for: "${query}"\n\n`;
          for (const r of results) {
            output += `### ${r.title} (${r.collection})\n`;
            output += `Slug: \`${r.slug}\``;
            if (r.section) output += ` | Section: ${r.section}`;
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

      case "agent-perturbatore": {
        const topic = input.topic as string;
        const mode = (input.mode as "soft" | "hard" | "max") || "hard";
        output = await agentPerturbatore(topic, mode);
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
        output = `## Tension Index\n\n`;
        if (result.slug) output += `Slug: \`${result.slug}\`\n\n`;
        output += `**Index: ${tiStr}**\n\n`;
        output += `Interpretation: ${result.interpretation}\n\n`;
        output += `### Scale:\n`;
        output += `- 0.0: No tension (possible easy consensus)\n`;
        output += `- 0.1–0.3: Low tension\n`;
        output += `- 0.3–0.6: Moderate tension\n`;
        output += `- 0.6–1.0: High tension\n`;
        output += `- 1.0–1.5: Critical tension\n`;
        output += `- 1.5+: Maximum tension (pattern collapse)\n`;
        break;
      }

      case "map-failure-graph": {
        const query = input.query as string | undefined;
        const vector = input.vector as string | undefined;
        const minWeight = (input.minWeight as number) ?? 1;

        const graph = mapFailureGraph({ query, vector, minWeight });
        output = formatGraphAsMarkdown(graph);
        break;
      }

      case "suggest-field-report": {
        const text = input.text as string;
        if (!text || !text.trim()) {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Missing required parameter: text"
          );
        }
        const report = suggestFieldReport(text);
        output = formatSuggestedReport(report);
        break;
      }

      case "gap-analysis": {
        const gaps = analyzeGaps();
        output = formatGapAnalysis(gaps);
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
          "Perturbator template — analysis with structural friction",
      },
      {
        name: "friction-analysis",
        description:
          "Friction analysis for a specific topic. Requires 'topic' parameter.",
        arguments: [
          {
            name: "topic",
            description: "Topic to analyze",
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
            role: "user",
            content: {
              type: "text",
              text: getAgentPerturbatorePrompt(),
            },
          },
        ],
        description:
          "System prompt for using the Perturbator in any conversation.",
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
            role: "user",
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
              text: `Analyze "${topic}" with structural friction.`,
            },
          },
        ],
        description: `Friction analysis for "${topic}".`,
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