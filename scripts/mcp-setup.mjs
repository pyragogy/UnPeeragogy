#!/usr/bin/env node

/**
 * mcp-setup.mjs — Configurazione atomica per MCP client.
 *
 * Uso:
 *   node scripts/mcp-setup.mjs --token <MCP_AUTH_TOKEN>
 *
 * Crea/aggiorna:
 *   ~/.config/Claude/claude_desktop_config.json  (Claude Desktop)
 *   ~/.config/pi/mcp.json                        (pi agent)
 *
 * Esempio:
 *   node scripts/mcp-setup.mjs --token up_abc123def456
 */

const BASE_URL = "https://mcp.unpeeragogy.pyragogy.org/mcp/sse";
const CONFIG_DIRS = {
  claude: {
    dir: `${process.env.HOME}/.config/Claude`,
    file: "claude_desktop_config.json",
    key: "mcpServers",
    serverName: "unpeeragogy",
  },
  pi: {
    dir: `${process.env.HOME}/.config/pi`,
    file: "mcp.json",
    key: "mcpServers",
    serverName: "unpeeragogy",
  },
};

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";

function parseArgs() {
  const args = process.argv.slice(2);
  const tokenIdx = args.indexOf("--token");
  if (tokenIdx === -1 || tokenIdx + 1 >= args.length) {
    console.error("❌ Manca il token. Usa: node mcp-setup.mjs --token <MCP_AUTH_TOKEN>");
    process.exit(1);
  }
  return { token: args[tokenIdx + 1] };
}

function buildConfig(token) {
  return {
    mcpServers: {
      unpeeragogy: {
        url: `${BASE_URL}?token=${token}`,
      },
    },
  };
}

function writeConfig(target, config) {
  const { dir, file, key, serverName } = target;

  // Ensure dir exists
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const filePath = `${dir}/${file}`;
  let existing = {};

  // Read existing config to merge (preserve other MCP servers)
  if (existsSync(filePath)) {
    try {
      existing = JSON.parse(readFileSync(filePath, "utf-8"));
    } catch {
      existing = {};
    }
  }

  // Merge: add/update our server entry
  if (!existing[key]) existing[key] = {};
  existing[key][serverName] = config[key][serverName];

  writeFileSync(filePath, JSON.stringify(existing, null, 2) + "\n");
  return filePath;
}

function main() {
  const { token } = parseArgs();
  console.log("⚡ Unpeeragogy MCP — Setup automatico");
  console.log(`   Token: ${token.slice(0, 8)}*** (nascosto)`);
  console.log(`   Endpoint: ${BASE_URL}?token=...\n`);

  const config = buildConfig(token);

  const written = [];
  for (const target of Object.values(CONFIG_DIRS)) {
    try {
      const path = writeConfig(target, config);
      written.push(path);
      console.log(`✅ ${path}`);
    } catch (err) {
      console.error(`❌ ${target.file}: ${err.message}`);
    }
  }

  console.log("\n✅ Fatto. Riavvia Claude Desktop per applicare la configurazione.");
  console.log("   Per pi: la configurazione è in ~/.config/pi/mcp.json");

  if (written.length === 0) {
    process.exit(1);
  }
}

main();