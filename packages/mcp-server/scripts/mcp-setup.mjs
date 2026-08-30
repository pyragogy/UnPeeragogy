#!/usr/bin/env node

/**
 * Unpeeragogy MCP — one-command setup
 *
 * Configures Claude Desktop and/or pi to connect to the Unpeeragogy MCP server.
 *
 * Usage:
 *   npx @pyragogy/mcp-server --setup --token <TOKEN>
 *   npx @pyragogy/mcp-server --setup --token <TOKEN> --server-url https://custom.domain.com
 *   npx @pyragogy/mcp-server --setup --token <TOKEN> --claude --pi
 *
 * Flags:
 *   --token, -t       MCP_AUTH_TOKEN (required)
 *   --server-url, -u  MCP server base URL (default: https://mcp.unpeeragogy.pyragogy.org)
 *   --claude          Configure Claude Desktop only
 *   --pi              Configure pi (coding agent) only
 *   --help, -h        Show this help
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join, resolve } from "node:path";

const HELP = `Usage:
  npx @pyragogy/mcp-server --setup --token <TOKEN> [options]

Required:
  --token, -t   MCP_AUTH_TOKEN for authentication

Options:
  --server-url, -u  MCP server URL (default: https://mcp.unpeeragogy.pyragogy.org)
  --claude          Configure Claude Desktop only
  --pi              Configure pi (coding agent) only
  --help, -h        Show this help

Examples:
  npx @pyragogy/mcp-server --setup --token up_abc123
  npx @pyragogy/mcp-server --setup --token up_abc123 --claude
  npx @pyragogy/mcp-server --setup --token up_abc123 --pi --server-url http://localhost:3001
`;

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    token: null,
    serverUrl: "https://mcp.unpeeragogy.pyragogy.org",
    claude: false,
    pi: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--token":
      case "-t":
        opts.token = args[++i] || null;
        break;
      case "--server-url":
      case "-u":
        opts.serverUrl = args[++i] || opts.serverUrl;
        break;
      case "--claude":
        opts.claude = true;
        break;
      case "--pi":
        opts.pi = true;
        break;
      case "--help":
      case "-h":
        opts.help = true;
        break;
    }
  }

  return opts;
}

function sanitizeUrl(base) {
  let url = base.replace(/\/+$/, "");
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  return url;
}

function getClaudeConfigPath() {
  const home = homedir();
  switch (platform()) {
    case "win32":
      return join(
        process.env.APPDATA || join(home, "AppData", "Roaming"),
        "Claude",
        "claude_desktop_config.json"
      );
    case "darwin":
      return join(
        home,
        "Library",
        "Application Support",
        "Claude",
        "claude_desktop_config.json"
      );
    default: // linux
      return join(home, ".config", "Claude", "claude_desktop_config.json");
  }
}

function getPiConfigPath() {
  return join(homedir(), ".config", "pi", "config.json");
}

function readJsonSafe(path) {
  try {
    if (existsSync(path)) {
      return JSON.parse(readFileSync(path, "utf-8"));
    }
  } catch {
    console.warn(`  ⚠️  Could not parse ${path}, starting fresh`);
  }
  return {};
}

function writeJsonSafe(path, data) {
  const dir = resolve(path, "..");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  return path;
}

function configureClaude(opts) {
  const configPath = getClaudeConfigPath();
  const config = readJsonSafe(configPath);

  if (!config.mcpServers) config.mcpServers = {};

  config.mcpServers["unpeeragogy"] = {
    url: `${sanitizeUrl(opts.serverUrl)}/sse`,
    headers: {
      Authorization: `Bearer ${opts.token}`,
    },
  };

  const writtenPath = writeJsonSafe(configPath, config);
  console.log(`  ✅ Claude Desktop: ${writtenPath}`);
  return writtenPath;
}

function configurePi(opts) {
  const configPath = getPiConfigPath();
  const config = readJsonSafe(configPath);

  if (!config.mcpServers) config.mcpServers = {};

  config.mcpServers["unpeeragogy"] = {
    url: `${sanitizeUrl(opts.serverUrl)}/sse`,
    headers: {
      Authorization: `Bearer ${opts.token}`,
    },
  };

  const writtenPath = writeJsonSafe(configPath, config);
  console.log(`  ✅ pi: ${writtenPath}`);
  return writtenPath;
}

function showVerification(opts) {
  const url = `${sanitizeUrl(opts.serverUrl)}/sse`;
  const headerExample = `Authorization: Bearer ${opts.token}`;

  console.log(`\n📋 Connection details:`);
  console.log(`  Server:      ${sanitizeUrl(opts.serverUrl)}`);
  console.log(`  SSE:         ${url}`);
  console.log(`  Auth:        Bearer header`);
  console.log(`               ${headerExample}`);
  console.log(`\n🔍 Verify:`);
  console.log(`  curl -s ${sanitizeUrl(opts.serverUrl)}/health`);
}

// ─── Main ──────────────────────────────────────────────────────
const opts = parseArgs();

if (opts.help) {
  console.log(HELP);
  process.exit(0);
}

if (!opts.token) {
  console.error("❌ Required: --token <MCP_AUTH_TOKEN>");
  console.error(`   ${HELP}`);
  process.exit(1);
}

console.log(`🔧 Unpeeragogy MCP — Setup\n`);

// Default: configure both if no specific flag
if (!opts.claude && !opts.pi) {
  opts.claude = true;
  opts.pi = true;
}

let configured = 0;
if (opts.claude) {
  configureClaude(opts);
  configured++;
}
if (opts.pi) {
  configurePi(opts);
  configured++;
}

console.log(`\n✅ ${configured} client(s) configured.`);
showVerification(opts);