# FUP-001 AI Use Log

This file records material uses of AI in the research workflow. AI proposals are not evidence.

## 2026-10-03 — Initial formalisation cycle

**System:** OpenAI ChatGPT, GPT-5.6 Sol  
**Role:** research orchestration, semantic reconstruction, candidate formal model generation  
**Inputs examined:** current UnPeeragogy repository files listed in `SEMANTIC_RECONSTRUCTION_v0.1.md`  
**Human principal investigator:** Fabrizio Terzi

### AI-produced artifacts

- research programme structure;
- semantic inventory;
- ambiguity register;
- formalism ADR;
- initial Alloy model;
- candidate invariants and intentionally false assertions;
- context-keeper sub-agent specification.

### Human validation still required

- semantic interpretation of “independence”;
- whether Gate A ACCEPTED requires corroboration in every case;
- admissible semantics of human override;
- execution and inspection of Alloy-generated instances;
- interpretation of any model-checking result;
- scientific contribution claims.

### Known limitation

The current runtime did not contain Alloy Analyzer/CLI, so the AI did not execute the Alloy model and makes no claim that the assertions passed or failed in an actual solver run.

### Disclosure principle

Any future paper must distinguish:

- AI-generated hypothesis/model/code;
- mechanically checked formal result;
- repository evidence;
- human interpretation of the result.
