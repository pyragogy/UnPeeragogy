# FUP-001 Ambiguity Register

Ambiguities are research outputs. They must not be silently “fixed” for mathematical convenience.

| ID | Ambiguity | Why it matters formally | Current treatment | Resolution test |
|---|---|---|---|---|
| A-001 | What makes two incidents/evidence items independent? | Corroboration depends on it. | Source-lineage independence is a conservative proxy in model v0.1. | Compare independent reporter, event and primary-origin definitions on historical cases. |
| A-002 | Does ACCEPTED always require corroboration? | Determines Gate A admissibility. | Do not encode as a hard fact yet. | Reconcile guide wording with accepted real cases. |
| A-003 | Minimum number for “multiple”. | Needed for finite corroboration checks. | Use ≥2 only as an explicit exploratory assumption. | Seek protocol revision or empirical decision rule. |
| A-004 | Is the epistemic lifecycle a total order? | Determines legal transitions. | Treat as partial/non-total. | Find real objects that skip/re-enter states. |
| A-005 | Semantics of “human judgment always overrides”. | Unbounded override can defeat every invariant. | Human decision is exogenous; override must remain auditable. | Define which constraints are advisory vs structural. |
| A-006 | Relationship among the four meanings of contested. | Lexical collision can create false implications. | Keep all axes separate. | Define explicit bridge rules only where repository semantics justify them. |
| A-007 | Gate B state vocabulary. | Publication is procedural but not a typed state. | Model minimal UNPUBLISHED/PUBLISHED state locally. | Compare with actual vault mutation history. |
| A-008 | Does source-linked imply traceable locator? | Affects verification semantics. | No automatic implication in v0.1. | Audit existing source-linked records. |
| A-009 | Can AI-research be an acquisition channel while AI is not evidence? | Channel/source distinction can be confused. | AI-assisted discovery may propose a candidate; evidential authority must reside in independently inspectable material. | Construct candidate with AI synthesis but no primary source; it must fail stronger grounding. |
| A-010 | What is withdrawn evidence supposed to do to prior decisions? | Needed for reversibility and liveness. | Deferred to temporal model. | Historical or synthetic withdrawal scenario. |
