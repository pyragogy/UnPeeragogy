# RUN AGENT — Session instructions for Pyragogy Engine runs

> Load this file at the start of every session where you are working on runs.
> Contains current state, operational protocol, and decision history.

---

## Project architecture

```
unpeeragogy/               ← main project
├── src/content/           ← vault (single source for graph + MCP)
│   ├── unpeeragogy/       ← patterns, field reports, analysis
│   └── peeragogy/         ← historical CC0 texts
├── runs/                  ← run output (gitignored)
│   ├── logs/              ← full JSON of each run
│   ├── proposals/         ← human-readable MDX proposals
│   └── archive/           ← closed/archived runs
└── RUN_AGENT.md           ← THIS FILE (load in every session)

engine/                    ← analysis engine (tool, not a project)
├── engine/
│   ├── agents/            ← A1, A2, A3, A5 (LLM)
│   ├── lib/tension.py     ← A4 (pure Python function)
│   ├── prompts/           ← prompts in English
│   └── dispatcher.py      ← orchestration
├── output/runs/           ← raw engine output (JSON)
└── output/proposals/      ← converted proposals
```

## Bridge: engine → vault

The engine produces JSON in `engine/output/runs/{run_id}/`. The `engine convert {run_id}` command transforms a JSON into a readable MDX proposal in `proposals/`. You read the proposal and decide whether to apply it to the vault.

**No automatic writing to the vault.** The vault is reviewed by you. This is consistent with the Research Protocol: "final editorial decision rests with the project".

---

## Operational protocol for a new run

### 1. Preparation

- Confirm the node slug exists in `src/content/unpeeragogy/{slug}.mdx`
- Read the frontmatter: `tension_index`, `title`
- Read previous runs on the same slug in `logs/` (if any)
- Decide `run_id`: format `{slug}-{date}-{seq}` e.g. `cooperation-2025-01-15-001`

### 2. Execution

```bash
cd /home/coder/project/engine
VAULT_ROOT=/home/coder/project/unpeeragogy/src/content \
python -m engine.main run-node \
  --slug {slug} \
  --run-id {run_id} \
  --output-dir /home/coder/project/unpeeragogy/runs/logs
```

### 3. Conversion to proposal (manual script)

```bash
cd /home/coder/project/unpeeragogy
python3 scripts/convert-run-to-proposal.py runs/logs/{run_id}.json --output runs/proposals/{slug}-{seq}.md
```

If the script doesn't exist yet, use the one-liner in the **Quick commands** section below.

### 4. Human review

- Read the proposal in `proposals/{slug}-{seq}.md`
- Evaluate:
  - Is the proposed `tension_index` credible?
  - Is the cited evidence relevant?
  - Is the perturbator quote useful or noisy?
- Decide:
  - **Apply**: modify `tension_index` in `src/content/unpeeragogy/{slug}.mdx`
  - **Archive**: move the proposal to `archive/` without modifying the vault
  - **Rework**: if the proposal is interesting but weak, flag for next iteration

### 5. Documentation

After each run, update this file:
- Add a row in **Run history** below
- Add **Decisions** if any emerged

---

## Current state

> ⚠️ **Audit-v1: FAILED** — The engine produced 81 proposals but 80% of the evidence
> came from only 3 sources (Node.js/io.js merger, Ethereum DAO, Wikipedia ArbCom).
> A2 kept repeating the same cases. Radical fix implemented: **CorpusRetriever**
> replaces A2 as primary evidence source. See Radical Fix section below.

- **Last slug worked on:** `cooperation`
- **Last run_id:** `audit-v1` (RESULT: FAILED — contamination)
- **Proposals generated:** 81 in `runs/proposals/audit-v1/` (not reviewable)
- **Prompts:** 4 active prompts (A1, A2, A3, A5) — all in English, v1
- **A4:** `lib/tension.py` (pure function, no LLM)
- **Tension scale:** 1.0–2.0
- **Circuit breaker:** `zero_accepted` (not `all_rejected`)
- **API key:** ✅ active
- **Web search:** ✅ Research Agent via Perplexity Sonar
- **Corpus Retriever:** ✅ 49 seed entries, TF-IDF + cosine similarity
- **Feedback loop:** ✅ accepted evidence enriches the corpus
- **vault_action:** ✅ active on A5 (structured prescription for the vault)

---

## Run history

| Date | Run ID | Slug | T_old → T_proposed | Status | Notes |
|------|--------|------|-------------------|--------|-------|
| 2026-09-03 | `dry-run-002` | `cooperation` | 1.6 → 2.24 (+0.640) | ✅ completed | DAO fork accepted, Boeing downgraded. $0.0115 |
| 2026-09-03 | `dry-run-004` | `cooperation` | 1.6 → 2.06 (+0.460) | ✅ completed | **Search Agent active**. Boeing BBC URL → accepted. DAO Wikipedia URL → accepted. 2/2 accepted. $0.0115 |
| 2026-09-03 | `dry-run-005` | `cooperation` | 1.6 → 2.00 (+0.560) | ✅ completed | **A2 domain + clamp [1.0, 2.0] + vault_action**. DAO downgraded, 1 accepted. $0.0133 |
| 2026-09-03 | `audit-v1` | 88 nodes | 1.326 avg → 1.765 | ❌ **FAILED** | 80% evidence from 3 sources. A2 collapsed. Radical fix implemented. $1.08 |

---

## Registered decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-01-15 | Bridge engine→vault via human-reviewed MDX proposals | Consistent with Protocol: "final editorial decision rests with the project" |
| 2025-01-15 | A4 removed as LLM, replaced by `lib/tension.py` | Unnecessary cost, latency, and arithmetic risk for a pure Python function |
| 2025-01-15 | Tension scale 0.0–3.2 | Consistent with existing vault (MCP, frontmatter, seed content) |
| 2025-01-15 | Circuit breaker: zero_accepted (not all_rejected) | "All degraded" was not caught by the old trigger |

### Radical Fix: CorpusRetriever (2026-09-03)

**Problem:** A2 (GPT-4o-mini) kept producing the same 3 empirical cases
(Node.js/io.js, DAO fork, Wikipedia ArbCom) across 58 different nodes. 80% of evidence
came from only 3 URLs — the audit is epistemically unusable.

**Solution:** Replace A2 as primary evidence source with a
**CorpusRetriever** based on TF-IDF + cosine similarity over a curated
corpus of 49 governance incidents.

**New architecture (corpus-first):**
```
A1 → CorpusRetriever.query() → top-K (max 4, weighted by diversity)
    → [if < 2 candidates] A2 fallback (LLM parametric recall)
    → Merge & dedup
    → Research Agent (URL verification)
    → Grounding Gate
    → A3 → A5
    → Feedback loop: accepted evidence → corpus.add_entry() → save
```

**Advantages:**
- **Deterministic:** same input → same output. Reproducible.
- **Diverse:** TF-IDF matching selects different entries for different patterns.
- **Growing:** feedback loop adds new evidence to the corpus after each run.
- **Cheaper:** no LLM call for A2 if the corpus is sufficient.

**Seed corpus:** 70 entries (54 complicating + 16 confirming), domains:
open-source (fork, governance, licences, review, release), DAO (crisis, fork,
constitution), cooperatives (Mondragon, holacracy), Wikipedia (ArbCom,
notability, featured articles, Signpost), standards (IETF, W3C), community
(Mastodon, Reddit, Stack Exchange), education (P2PU, Moodle, MOOC).

### Empirical Quadrilateral (2026-09-03)

**Problem:** The original audit only looked for failures (complicating/contradicting),
creating symmetric bias. Every node needs 2 complicating + 2 confirming to give a
complete picture.

**Solution:** Balanced retrieval in `CorpusRetriever.query(balanced=True)`:
- top_k/2 with `valence=confirming` (pattern works)
- top_k/2 with `valence=complicating` (pattern fails)

**A5 vault_action** now includes two new mandatory fields:
- `negative_rule`: "What NOT to do" — from complicating evidence
- `positive_rule`: "Success condition" — from confirming evidence

**Corpus: 70 entries** (54 complicating + 16 confirming).

**Status:** Implemented, tested on 5 nodes. Quadrilateral works on 4/5.
`carrying` has only 3 candidates (1 confirming below 0.05 threshold) — will improve
with feedback loop.

| 2025-01-15 | A1 prompt guardrails against hallucination added | Same protection level as A2 |
| 2025-01-15 | A2 model changed: deepseek → gpt-4o-mini | deepseek-r1-distill-qwen-32b not available on OpenRouter |
| 2025-01-15 | A5 model changed: claude-3.5-sonnet → claude-sonnet-4 | 3.5 Sonnet no longer available on OpenRouter |
| 2025-01-15 | Grounding Gate: case-insensitive for DOI, empirical | LLM produces DOI: (uppercase), Gate searched for doi: |
| 2025-01-15 | Grounding Gate: accept parametric-recall | Epistemically honest — retrieval_confidence captures uncertainty |
| 2025-01-15 | Dispatcher: checkpoint serializes Pydantic lists | A2 produces list[EvidenceCandidate], not directly serialisable |
| 2025-01-15 | Dispatcher: status not overwritten after A5 failed | loop2_completed + status="completed" were overriding failure |
| 2025-01-15 | **Entity Anchoring** — A2 required to cite specific entity | Meta-citations banned ("a study has shown"). Every candidate must have entity_name, entity_year, or DOI. |
| 2025-01-15 | **Bidirectional delta** — tension can increase or decrease | confirming=-0.5, complicating=+1.0, contradicting=+1.5. EvidenceCandidate schema now includes fenomeno_type. |
| 2025-01-15 | **Grounding Gate** — accepts URL, entity anchoring check | Gate now verifies has_entity_anchor(). If no entity_name/DOI/URL, candidate passes but A3 penalises it. |
| 2025-01-15 | **A4 permanently removed** — agent file and prompt deleted | References removed from agents/__init__.py, main.py, health.py, registry.yaml |
| 2026-09-03 | **Research Agent (Search via Sonar)** — `engine/lib/search.py` | Upgraded parametric-recall → verified URLs. 3/3 tests passed. |
| 2026-09-03 | **A2 domain** — corporate top-down cases banned | Boeing, Enron, Theranos, industrial disasters prohibited. Only open source, DAO, communities, research. |
| 2026-09-03 | **vault_action in A5** — structured vault prescription | Every synthesis must include target_section, action_type, patch_proposal, rationale. |
| 2026-09-03 | **Clamp [1.0, 2.0]** — new vault scale | Google was right: real vault data sits between 0.93 and 2.0. The 0.0–3.2 scale was theoretical. 1.0–2.0 is the real operational scale. |
| 2026-09-03 | **Empirical Quadrilateral** — 2 confirming + 2 complicating per node | Symmetric bias fix: the original audit only looked for failures. Corpus retriever now balances by valence. |
| 2026-09-03 | **positive_rule + negative_rule** in vault_action | A5 now produces positive rule (success condition) and negative rule (what to avoid) based on the Quadrilateral. |
| 2026-09-03 | **Corpus expanded to 70 entries** (54 comp + 16 conf) | Added 16 confirming entries: Apache consensus, Debian release, Python SC, KDE council, OSM DWG, etc. |

---

## Quick commands

```bash
# Single run (verified real command)
cd /home/coder/project/engine
VAULT_ROOT=/home/coder/project/unpeeragogy/src/content \
python3 -m engine.main run-node cooperation --run-id pilot-001 --no-health

# Copy log to unpeeragogy (after the run)
cp engine/output/runs/{run-id}/{slug}.json \
  /home/coder/project/unpeeragogy/runs/logs/{slug}-{seq}.json

# Convert run to proposal (manual script)
cd /home/coder/project/unpeeragogy
python3 -c "
import json
with open('runs/logs/cooperation-001.json') as f:
    data = json.load(f)
t = data['tension']
print(f'Tension: {t[\"old_tension\"]} → {t[\"proposed_new_tension\"]} (Δ=+{t[\"delta\"]})')
print(f'Accepted: {t[\"accepted_count\"]}, Degraded: {t[\"degraded_count\"]}, Rejected: {t[\"rejected_count\"]}')
"

# Quick bug fix: OpenRouter models
# A2:  openai/gpt-4o-mini (used, was deepseek/deepseek-r1-distill-qwen-32b)
# A5:  anthropic/claude-sonnet-4 (used, was claude-3.5-sonnet)
```

---

## References

- **Research Protocol:** `/home/coder/.pi/agent/skills/evidence-protocol/SKILL.md`
- **Vault node cooperation:** `/home/coder/project/unpeeragogy/src/content/unpeeragogy/cooperation.mdx`
- **Engine lib/tension.py:** `/home/coder/project/engine/engine/lib/tension.py`
- **META_PROMPT:** `/home/coder/project/engine/engine/prompts/META_PROMPT.md`
- **Project AGENTS.md:** `/home/coder/project/unpeeragogy/AGENTS.md`