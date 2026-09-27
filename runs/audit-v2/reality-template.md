# Reality Column Template — Schema

Every `.mdx` node in `src/content/unpeeragogy/` follows this structure.

## Frontmatter (meta)

```yaml
---
title: "Node Title"
order: N
section: "SectionName"
readingTime: 1
tension_index: X.X
tags: ["tag1", "tag2"]
origin: "audit-v2"
---
```

- `tension_index`: new tension proposed by audit-v2 (1.0–2.0)
- `origin`: `"audit-v2"` for engine-generated nodes, `"seed"` for originals

## Content structure (right column)

```
## Summary

Brief node description. What the pattern says, what it promises.

## Grounded Evidence

### 🔹 Confirming (2)

**Case 1 — Entity Name**
- **Phenomenon:** Brief case description and how it confirms the pattern
- **Source:** [Verified URL](...)
- **Original claim:** Textual quote from the case

**Case 2 — Entity Name**
- ...

### 🔸 Complicating (2)

**Case 3 — Entity Name**
- **Phenomenon:** Brief description and how it complicates the pattern
- **Source:** [Verified URL](...)
- **Original claim:** Textual quote from the case

**Case 4 — Entity Name**
- ...

## Operational Heuristics

### Positive Rule (success conditions)

> Textual quote from A5's `positive_rule`

### Negative Rule (what to avoid)

> Textual quote from A5's `negative_rule`

## Oblique Synthesis

Synthetic analysis: what this pattern means in light of the evidence.
Derived from A5's oblique/source/observation block.

> **Perturbator:** _Textual quote from the Perturbator_

## Traceability

- **Audit reference:** `runs/audit-v2/{slug}.json`
- **Diversity check:** 52 unique entities, 50 source URLs, $D = 0.609$