#!/usr/bin/env node

/**
 * stdio-bridge.mjs — Ponte stdio ↔ SSE per bypassare l'OAuth di Claude Desktop.
 *
 * Claude Desktop lancia questo script come `command` in claude_desktop_config.json.
 * Lo script:
 *   1. Si connette al server MCP remoto via SSE (con token in query param)
 *   2. Parla con Claude Desktop via stdio (JSON-RPC)
 *   3. Fa da bidirezionale: stdin → POST /messages e SSE → stdout
 *
 * Uso:
 *   export MCP_AUTH_TOKEN=up_...
 *   node scripts/stdio-bridge.mjs
 */

const MCP_TOKEN = process.env.MCP_AUTH_TOKEN;
if (!MCP_TOKEN) {
  console.error("MCP_AUTH_TOKEN mancante");
  process.exit(1);
}

const REMOTE = "https://mcp.unpeeragogy.pyragogy.org";
const SSE_URL = `${REMOTE}/sse?token=${MCP_TOKEN}`;
const MESSAGES_URL = `${REMOTE}/messages`;

let sessionEndpoint = null;
let messageBuffer = [];

(async () => {
  // 1. Collega SSE
  const resp = await fetch(SSE_URL);
  if (!resp.ok) {
    console.error(`SSE connection failed: ${resp.status}`);
    process.exit(1);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  // 2. Leggi eventi SSE e scrivi su stdout (per Claude Desktop)
  async function readSSE() {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("event: ")) continue;
        if (line.startsWith("data: ")) {
          const msg = line.slice(6);
          // L'SDK MCP manda prima l'endpoint della sessione
          if (msg.startsWith("http") || msg.startsWith("/")) {
            sessionEndpoint = msg.startsWith("http") ? msg : `${REMOTE}${msg}`;
            console.error(`✅ Session: ${sessionEndpoint}`);
            // Svuota buffer messaggi
            for (const m of messageBuffer) {
              sendMessage(m);
            }
            messageBuffer = [];
          } else {
            // Messaggio JSON-RPC → stdout per Claude
            process.stdout.write(msg + "\n");
          }
        }
      }
    }
  }

  // 3. Invia messaggio al server remoto via POST
  async function sendMessage(msg) {
    if (!sessionEndpoint) {
      messageBuffer.push(msg);
      return;
    }
    try {
      const url = `${sessionEndpoint}${sessionEndpoint.includes('?') ? '&' : '?'}token=${MCP_TOKEN}`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });
    } catch (err) {
      console.error(`POST error: ${err.message}`);
    }
  }

  // 4. Leggi da stdin (da Claude Desktop) e invia al server
  let stdinBuf = "";
  process.stdin.setEncoding("utf-8");
  process.stdin.on("data", (chunk) => {
    stdinBuf += chunk;
    const lines = stdinBuf.split("\n");
    stdinBuf = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        sendMessage(JSON.parse(trimmed));
      } catch {}
    }
  });
  process.stdin.on("end", () => process.exit(0));

  // Avvia lettura SSE
  readSSE().catch((err) => {
    console.error(`SSE error: ${err.message}`);
    process.exit(1);
  });
})();