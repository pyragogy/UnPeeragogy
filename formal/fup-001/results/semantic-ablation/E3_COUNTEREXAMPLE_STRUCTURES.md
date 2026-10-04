# E3 — Counterexample and Divergence Structures

Source: `independence-semantics-s6.als` (canonical model at scope 6, SAT4J, primary run)
Base run: `20261004T081813Z-primary-s6-sat4j`

## Lemma

All structures below are bounded scope 6 instances. They demonstrate reachable
classification divergence, not proof of universal possibility.

---

## 1. SourceCorroborationImpliesLineageCorroboration — SAT (counterexample)

**Claim:** Every claim corroborated under source-node multiplicity is also
corroborated under lineage independence.

**Counterexample structure:**
- Two empirical evidence items (`Evidence$1`, `Evidence$2`)
- Different source atoms — `indSource[e1,e2]` holds → `corroboratedSource[c]`
- Source atoms share a common root — `indLineage[e1,e2]` fails (shared lineage)
- → `sourceCorroboration` without `lineageCorroboration`

**Significance:** Source-node multiplicity alone is insufficient for
provenance-aware corroboration. Two distinct sources descending from the same
root produce the same evidential fragility as a single source.

**Counterexample witness atoms (skolem):**
- Claim$0, Evidence$1, Evidence$2

---

## 2. ReporterCorroborationImpliesIncidentCorroboration — SAT (counterexample)

**Claim:** Every claim corroborated under reporter independence is also
corroborated under incident independence.

**Counterexample structure:**
- Two empirical evidence items (`Evidence$0`, `Evidence$1`)
- Different reporters — `indReporter[e1,e2]` holds → `corroboratedReporter[c]`
- Neither evidence item carries an incident assignment
- → `indIncident[e1,e2]` fails (no incident to compare) → `corroboratedIncident[c]` fails

**Significance:** Reporter diversity does not imply incident diversity. Two
different reporters may witness the same event (incident). The independence
semantics are not interchangeable.

**Counterexample witness atoms (skolem):**
- Claim$0, Evidence$0, Evidence$1

---

## 3. IncidentCorroborationImpliesReporterCorroboration — SAT (counterexample)

**Claim:** Every claim corroborated under incident independence is also
corroborated under reporter independence.

**Counterexample structure:**
- Two empirical evidence items (`Evidence$4`, `Evidence$5`)
- Different incidents (Incident$0, Incident$1) — `indIncident[e1,e2]` holds
- Neither evidence item carries a reporter assignment
- → `indReporter[e1,e2]` fails → `corroboratedReporter[c]` fails

**Significance:** Two distinct incidents may be reported by an anonymity channel
(no reporter). Incident diversity alone does not guarantee reporter diversity.

**Counterexample witness atoms (skolem):**
- Claim$5, Evidence$4 (Incident$1), Evidence$5 (Incident$0)

---

## 4. ReporterCorroborationImpliesLineageCorroboration — SAT (counterexample)

**Claim:** Every claim corroborated under reporter independence is also
corroborated under lineage independence.

**Counterexample structure:**
- Two empirical evidence items (`Evidence$2`, `Evidence$3`)
- Different reporters (Reporter$0, Reporter$1) — `indReporter[e1,e2]` holds
- Same source atom (Source$0) — lineage roots intersect → `indLineage[e1,e2]` fails

**Significance:** Two reporters can report on evidence from the same source.
Reporter diversity does not imply source-lineage diversity. The strongest
single-dimension independence (lineage) is not entailed by reporter diversity.

**Counterexample witness atoms (skolem):**
- Claim$0, Evidence$2 (Reporter$1, Source$0), Evidence$3 (Reporter$0, Source$0)

---

## 5. FP_SourceVsLineage — SAT (witness)

**Same structure as #1.** Explicit witness for the "false positive" scenario:
source-node corroboration where lineage corroboration is blocked.

---

## 6. DIV_ReporterVsIncident — SAT (witness)

**Same structure as #2.** Explicit witness for reporter-but-not-incident.

---

## 7. DIV_IncidentVsReporter — SAT (witness)

**Same structure as #3.** Explicit witness for incident-but-not-reporter.

---

## 8. DIV_ReporterVsLineage — SAT (witness)

**Same structure as #4.** Explicit witness for reporter-but-not-lineage.

---

## 9. DIV_IncidentVsLineage — SAT (witness)

**Structure:**
- Two empirical evidence items (`Evidence$4`, `Evidence$5`)
- Different incidents (Incident$0, Incident$1) — `indIncident[e1,e2]` holds
- Same source atom (Source$0) — lineage shared → `indLineage[e1,e2]` fails

**Significance:** Incident diversity does not imply lineage diversity — two
different incidents can originate from the same source lineage.

---

## 10. AGREE_Strong — SAT (witness)

**Structure:**
- Two empirical evidence items (`Evidence$0`, `Evidence$1`)
- Claim$4 references both as evidence
- Both empirical, different sources with disjoint lineages, different reporters,
  different incidents
- → All three independence predicates SAT simultaneously

**Significance:** The three independence semantics are not mutually exclusive.
A claim can achieve corroboration under all three criteria when the evidence
base is sufficiently diverse.

---

## Summary of divergence directions

| Independence A | Independence B | A→B | Witness type |
|---|---|---|---|
| source-node     | lineage         | SAT (NOT implied) | FP_SourceVsLineage |
| reporter        | incident        | SAT (NOT implied) | DIV_ReporterVsIncident |
| incident        | reporter        | SAT (NOT implied) | DIV_IncidentVsReporter |
| reporter        | lineage         | SAT (NOT implied) | DIV_ReporterVsLineage |
| incident        | lineage         | (not asserted)    | DIV_IncidentVsLineage |

All four cross-semantic implications are **falsified**. No independence definition
entails any other. Lineage independence is the strictest: it is never entailed by
source, reporter, or incident diversity, but can co-occur with all three
(AGREE_Strong).