# E4 — Gate D Adversarial Validation — Counterexample Structures

Source: `adversarial-independence-s6.als` (scope 6, SAT4J, primary run)
Base run: `20261004T082513Z-primary-s6-sat4j`

## Model constraints (attacks D1–D2)

- reporter is **mandatory** (one Reporter per Evidence) — D1 null-metadata removed
- incident is **mandatory** (one Incident per Evidence) — D1 null-metadata removed
- `exactlyTwoEvidence[c]` — D2 cardinality restricted to exactly 2

---

## 1. CompleteReporterImpliesIncident — SAT (counterexample)

**Claim:** Reporter independence implies incident independence (under complete metadata).

**Counterexample structure:**
- Evidence$2: reporter=Reporter$0, incident=Incident$0
- Evidence$3: reporter=Reporter$1, incident=Incident$0
- Same incident (Incident$0), different reporters → `reporterIndependent` holds, `incidentIndependent` fails

**Attack D1 survived:** Even with mandatory reporter AND incident, reporter diversity does not force incident diversity. Two reporters can witness the same incident.

| Witness | reporter | incident |
|---|---|---|
| Evidence$2 | Reporter$0 | Incident$0 |
| Evidence$3 | Reporter$1 | Incident$0 |

---

## 2. CompleteIncidentImpliesReporter — SAT (counterexample)

**Claim:** Incident independence implies reporter independence (under complete metadata).

**Counterexample structure:**
- Evidence$4: source=Source$0, reporter=Reporter$0, incident=Incident$0
- Evidence$5: source=Source$0, reporter=Reporter$0, incident=Incident$1
- Same reporter (Reporter$0), different incidents → `incidentIndependent` holds, `reporterIndependent` fails

**Attack D1 survived:** Two different incidents can be reported by the same reporter.

| Witness | reporter | incident |
|---|---|---|
| Evidence$4 | Reporter$0 | Incident$0 |
| Evidence$5 | Reporter$0 | Incident$1 |

---

## 3. CompleteSourceImpliesLineage — SAT (counterexample)

**Claim:** Source-node diversity implies lineage independence.

**Counterexample structure:**
- Evidence$4: source=Source$2 (root)
- Evidence$5: source=Source$1
- Source lineage: Source$1 → Source$0 → Source$3 → Source$2 (root)
- Different source nodes (Source$2 ≠ Source$1) → `sourceIndependent` holds
- Common root (Source$2) → `lineageIndependent` fails

**Attack D3 survived:** Different immediate source atoms can descend from the same provenance root. Source-node multiplicity is not lineage independence.

| Witness | source | lineage chain |
|---|---|---|
| Evidence$4 | Source$2 | Source$2 (root) |
| Evidence$5 | Source$1 | Source$1 → Source$0 → Source$3 → Source$2 |

---

## 4. SurfaceDiversityImpliesLineage — SAT (counterexample)

**Claim:** All three surface diversities together imply lineage independence.

**Counterexample structure:**
- Two evidence items with ALL THREE surface diversities:
  - Different source atoms
  - Different reporters
  - Different incidents
- But shared provenance root

**Attack D3 (worst-case):** Even when source-node, reporter, AND incident are simultaneously different, the lineage can still be shared. Provenance is orthogonal to all three observable dimensions.

| Witness | source | reporter | incident |
|---|---|---|---|
| Evidence$1 | (different) | (different) | (different) |
| Evidence$2 | (different) | (different) | (different) |
| Lineage | COMMON ROOT | — | — |

---

## 5. ADV_SourceVsLineage — SAT (witness)

**Same structure as #3.** Explicit witness: two empirical evidence items with different source nodes but shared lineage. `exactlyTwoEvidence` satisfied.

---

## 6. ADV_ReporterVsIncident — SAT (witness)

**Same structure as #1.** Two reporters, same incident, exactly two evidence items. Complete metadata (mandatory reporter + incident).

---

## 7. ADV_IncidentVsReporter — SAT (witness)

**Same structure as #2.** Two incidents, same reporter, exactly two evidence items.

---

## 8. ADV_ReporterSourceVsLineage — SAT (witness)

**Structure:**
- Two evidence items with different reporters AND different source nodes
- Shared lineage root
- Combined reporter + source diversity does NOT force lineage independence.

| Witness | reporter | source | lineage |
|---|---|---|---|
| Evidence$1 | Reporter$0 | Source$(A) | shared root |
| Evidence$2 | Reporter$1 | Source$(B) | shared root |

---

## 9. ADV_AllSurfaceDiversitySharedLineage — SAT (witness) ✅

**STRUCTURE CONFIRMED — KEY RESULT**

**Structure:**
- Claim$2 with evidence: Evidence$2, Evidence$3
- Evidence$2: source=Source$0, reporter=Reporter$0, incident=Incident$0
- Evidence$3: source=Source$1, reporter=Reporter$1, incident=Incident$2
- All three surface diversities: source ✓, reporter ✓, incident ✓
- BUT: Source$0 and Source$1 share a common provenance root
- → `lineageIndependent` fails

**Significance:** Provenance lineage remains an orthogonal dimension even when ALL three observable diversities (source node, reporter, incident) are simultaneously satisfied. Lineage is not reducible to any combination of surface metadata.

| Witness atom | source | reporter | incident | lineage root |
|---|---|---|---|---|
| Evidence$2 | Source$0 | Reporter$0 | Incident$0 | shared |
| Evidence$3 | Source$1 | Reporter$1 | Incident$2 | shared |

---

## 10. ADV_AllDimensionsIndependent — SAT (witness) ✅

**POSITIVE CONTROL — STRUCTURE CONFIRMED**

**Structure:**
- Claim$5 with evidence: Evidence$3, Evidence$4
- Evidence$3: source=Source$0, reporter=Reporter$0, incident=Incident$0
- Evidence$4: source=Source$1, reporter=Reporter$1, incident=Incident$2
- Source$0 and Source$1 have DISJOINT lineages (different roots)
- → all four independence predicates SAT simultaneously

**Significance:** The model is NOT overconstrained. Full independence (source + reporter + incident + lineage) is reachable. The above divergences are genuine semantic differences, not artifacts of contradictory constraints.

| Witness atom | source | reporter | incident | lineage |
|---|---|---|---|---|
| Evidence$3 | Source$0 | Reporter$0 | Incident$0 | disjoint |
| Evidence$4 | Source$1 | Reporter$1 | Incident$2 | disjoint |

---

## Summary

| Pattern | D-attack | SAT? | Survives? |
|---|---|---|---|
| reporter→incident impl. | D1 (no null meta) | SAT (falsified) | ✅ |
| incident→reporter impl. | D1 (no null meta) | SAT (falsified) | ✅ |
| source-node→lineage impl. | D3 (surface div) | SAT (falsified) | ✅ |
| surface ALL→lineage impl. | D3 (worst case) | SAT (falsified) | ✅ |
| ADV_AllSurfaceDiversitySharedLineage | D3 | SAT | ✅ |
| ADV_AllDimensionsIndependent | D4 (positive control) | SAT | ✅ |
| ADV_SourceVsLineage | D2 (exactly 2) | SAT | ✅ |
| ADV_ReporterVsIncident | D1+D2 | SAT | ✅ |
| ADV_IncidentVsReporter | D1+D2 | SAT | ✅ |
| ADV_ReporterSourceVsLineage | D1+D2+D3 | SAT | ✅ |

All four attacks survived. No scope or solver disagreement.