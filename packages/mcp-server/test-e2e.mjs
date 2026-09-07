// E2E test for the new zero-latency Phase 0 prompt
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const transport = new SSEClientTransport(
  new URL("http://localhost:3099/sse"),
  { requestInit: { headers: { Authorization: "Bearer test-token-up_" } } }
);
const client = new Client({ name: "e2e-test", version: "1.0.0" });

await client.connect(transport);

// List prompts
const prompts = await client.listPrompts();
console.log("Prompts:", prompts.prompts.map((p) => p.name).join(", "));

// Get the prompt (raw transport-level to bypass SDK role validation on system msgs)
// Use the low-level request
const promptResult = await client.getPrompt({ name: "agent-perturbatore" });
const msg = promptResult.messages[0];
console.log("Prompt role:", msg.role);
const text = msg.content.text;
console.log("Prompt length:", text.length);
console.log("Has pre-loaded data:", text.includes("PRE-LOADED CORPUS CONTEXT"));
console.log("Has corpus stats:", text.includes("173 entries"));
console.log("Has no-need-to-call:", text.includes("You do NOT need to call"));
console.log("Has suggest-only:", text.includes("ONLY when"));
console.log("Has most-fractured:", text.includes("MOST FRACTURED PATTERNS"));

// List tools
const tools = await client.listTools();
console.log("\nTools:", tools.tools.map((t) => t.name).join(", "));

// Call suggest-field-report (the one remaining Phase 0 runtime tool)
const report = await client.callTool({
  name: "suggest-field-report",
  arguments: { text: "We tried weekly meetings but after a month nobody showed up anymore" },
});
const reportText = report.content[0].text;
console.log("\nsuggest-field-report length:", reportText.length);
console.log("Report has detected vectors:", reportText.includes("Vettori di fallimento rilevati"));

// Verify the 3 expensive tools still work (they are now optional, not auto-called)
const gap = await client.callTool({ name: "gap-analysis", arguments: {} });
console.log("\ngap-analysis length:", gap.content[0].text.length);

await client.close();
console.log("\n✅ E2E test passed");
process.exit(0);
