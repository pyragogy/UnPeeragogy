# FUP-001 Claim–Evidence Ledger

| Claim | Status | Repository support | Formal support | Counterevidence / risk |
|---|---|---|---|---|
| UnPeeragogy uses multiple independent state dimensions. | SUPPORTED | candidate schemas, evidence taxonomy, research data model | model v0.1 keeps axes separate | Prose lifecycle diagrams can visually suggest a single flow. |
| Automation must not assign substantive human review outcomes. | SUPPORTED | Human Review Guide; human review ledger comments | assertion/fact target I-01 | Future architecture could introduce delegated review; would require protocol change. |
| Gate A is distinct from Gate B. | SUPPORTED | Human Review Guide; ledger | scenario and assertion target I-03 | Need explicit typed Gate B state in canonical schema. |
| Synthetic scenarios must not count as empirical corroboration. | SUPPORTED | Research Data Model; integrity validator | assertion target I-04 | Need precise definition of “count” across all downstream metrics. |
| Corroboration requires independent evidence. | SUPPORTED WITH AMBIGUITY | protocol and review guide | v0.1 exploratory constraint | Independence relation is underspecified. |
| Source-lineage disjointness is the correct definition of independence. | HYPOTHESIS | no direct canonical rule | exploratory predicate only | Independent events can share a source; different URLs can share an origin. |
| Every ACCEPTED candidate requires prior corroboration. | UNRESOLVED | guide wording suggests it; Gate A meaning and case history may permit less | deliberately not a hard fact | CAN-001 needs reconstruction. |
| A revised interpretation must preserve history. | SUPPORTED | protocol, data model, git/revision fields | assertion target I-05 | Git history may preserve changes even when semantic `revised_from` is missing. |
| Formal verification can detect epistemic-governance failures not caught by current schema validation. | HYPOTHESIS | current integrity script checks only a subset of cross-field semantics | Gate C target | Must demonstrate concrete counterexamples before claiming contribution. |
