# Human Review Guide

**How to review practitioner evidence without turning AI proposals into canonical knowledge.**

## 1. Why human review exists

AI can collect, normalise, compare, and propose evidence candidates.

Only a human (or a group) decides what becomes validated knowledge.

> **AI proposal ≠ validated knowledge.**

This is the central principle of the UnPeeragogy evidence protocol. The automated pipeline prepares epistemic situations; the human decides.

---

## 2. The three acquisition channels

### Practitioner

Direct experience — Critical Incident Technique (CIT), field reports, GitHub Discussions. The author was there.

### Documentary

Papers, repository history, platform records, institutional sources. The document was there.

### AI-assisted research

AI finds or aggregates sources, but the sources themselves must be independently verifiable. AI as research assistant, not epistemic authority.

All channels enter as **candidates**. No channel bypasses the human gate.

---

## 3. What happens when a new contribution arrives

```
Contribution
      ↓
  Candidate          ← automated
      ↓
Provenance check
      ↓
Evidence review      ← HUMAN GATE
      ↓
 Human decision      ← Gate A
      ↓
  validated knowledge
      ↓
  vault mutation     ← Gate B (separate)
```

---

## 4. Reviewer checklist

### Source

- [ ] Who is making the claim?
- [ ] Is this direct or indirect experience?
- [ ] Are date and context identifiable?
- [ ] Is the original source preserved (URL, archive, stable reference)?

### Observation vs interpretation

- [ ] Which elements are observations (what happened)?
- [ ] Which elements are interpretations (what the author thinks it means)?
- [ ] Are there causal inferences not supported by evidence?

### Corroboration

- [ ] Do documentary sources exist?
- [ ] Are the sources independent of each other?
- [ ] Do they confirm the event, or also the interpretation?
- [ ] Two URLs ≠ two independent sources. Check carefully.

### Theory mapping

- [ ] Which vault node / theoretical claim is touched?
- [ ] Is the proposed relationship confirming, complicating, contradicting, or ambiguous?
- [ ] Are there alternative explanations?
- [ ] What evidence could falsify this interpretation?

### Decision

- [ ] Do I have enough information to decide?
- [ ] Am I validating the evidence, or just agreeing with the author?
- [ ] Am I keeping Gate A and Gate B separate?

---

## 5. Human decision states

### ACCEPTED

Evidence is sufficiently documented, with adequate provenance and corroboration, to enter the validated knowledge base.

Does **not** mean "definitively true."

### REJECTED

Not usable as evidence in its current state.

Does **not** necessarily mean the event is false.

### REVISE

Material is usable, but classification, target, or interpretation needs correction.

### NEEDS_EVIDENCE

Case is interesting but insufficiently documented. Acceptable to leave here.

### CONTESTED

Incompatible readings or conflicting evidence exist. Disagreement is preserved.

### PENDING

No human decision has been taken yet.

---

## 6. Important distinction — Accepting evidence ≠ agreeing with the author

`ACCEPTED` means:

> Sufficiently documented to enter the epistemic process.

It does **not** mean:

> The author is necessarily right in their interpretation.

**Example — Discussion #7:**
- Practitioner account: **ACCEPTED** (Fabrizio's first-person report)
- Wikibooks documentary record: **corroboration** (confirms the sequence of events)
- Interpretation of theoretical meaning: **still separable and revisable**
- The author's interpretation (category failure) is supported but not proven — it remains open to revision, complication, or falsification

---

## 7. Gate A vs Gate B

### Gate A — Epistemic validation

> Can this evidence contribute to the validated knowledge base?

Question for the human reviewer: is the evidence sufficiently documented, with identifiable provenance, to be taken seriously as an epistemic object?

### Gate B — Publication

> Should this validation produce a public vault mutation now?

Question for the project maintainer: does the evidence warrant a change to the vault — updating tension_index, adding heuristics, modifying patterns?

`ACCEPTED at Gate A` does **not** automatically imply `vault mutation at Gate B`.

---

## 8. Quick decision tree

```text
Is the source identifiable?
        |
       NO → NEEDS_EVIDENCE
        |
       YES
        |
Is observation distinguishable from interpretation?
        |
       NO → REVISE / NEEDS_EVIDENCE
        |
       YES
        |
Is there enough provenance / corroboration?
        |
       NO → NEEDS_EVIDENCE
        |
       YES
        |
Does evidence meaningfully relate to a claim?
        |
       NO → REJECTED or archive as context
        |
       YES
        |
Are major interpretations unresolved?
      /    \
    YES     NO
     |       |
CONTESTED  ACCEPTED
```

This tree is **orientative**, not mechanical. Human judgment always overrides.

---

## 9. Minimum reviewer record

Every decision must record:

| Field | Required | Example |
|-------|----------|---------|
| candidate_id | Yes | CAN-001 |
| source | Yes | Discussion #7 |
| reviewer | Yes | Fabrizio |
| decision | Yes | ACCEPTED |
| date | Yes | 2026-09-28T12:59:00Z |
| rationale | Yes | Brief, evidence-grounded |
| proposed target | Yes | assessment |
| proposed valence | Yes | complicating |
| unresolved questions | Optional | What about the license change? |
| resulting action | Yes | human_validated |

---

## 10. Anti-patterns

**DO NOT:**

- Accept because you personally know the author.
- Reject because you disagree with the conclusion.
- Treat two URLs as two independent sources automatically.
- Turn a correlation into a causal claim.
- Let AI assign ACCEPTED (automation only sets PENDING).
- Delete contested evidence — preserve it for the record.
- Mutate vault content automatically after Gate A acceptance.

---

## 11. Reviewer Quick Reference

**One screen. Open this every time a new Discussion arrives.**

```
1. PROVENANCE
   - Who? Direct/indirect? Date? Source preserved?

2. OBSERVATION vs INTERPRETATION
   - What happened? vs What does the author think it means?
   - Causal inferences? Separable?

3. CORROBORATION
   - Documentary sources? Independent? Confirm event or interpretation?
   - Two URLs ≠ two independent sources.

4. THEORY MAPPING
   - Which node/claim? Confirming/complicating/contradicting/ambiguous?
   - Alternative explanations? Possible falsifier?

5. COUNTEREVIDENCE
   - What would disprove this interpretation? Recorded?

6. HUMAN DECISION (Gate A)
   - ACCEPTED / REJECTED / REVISE / NEEDS_EVIDENCE / CONTESTED
   - Record: candidate_id, source, reviewer, date, rationale, target, valence, action.

7. GATE B (separate decision)
   - ACCEPTED at Gate A ≠ mutare il vault automaticamente.
   - Vault change requires explicit editorial decision.
```

---

## References

- Full protocol: [Protocol page](/protocol/)
- Candidate schemas: `src/data/candidate-schemas.ts`
- Ledger: `runs/human-review-ledger.yaml`
- Research data model: `docs/RESEARCH_DATA_MODEL.md`