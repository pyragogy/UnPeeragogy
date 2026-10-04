# FUP-001 Independence Ablation Protocol

## Objective

Test whether plausible definitions of “independent evidence” produce different corroboration classifications over the same finite evidence structures.

This experiment is the primary candidate for Gate C.

## Competing semantics

### IND-S — source-node multiplicity

Two evidence items are independent if they reference distinct immediate source nodes.

This is intentionally naive and approximates the common mistake “two URLs = two sources”.

### IND-L — source-lineage independence

Two evidence items are independent if their root provenance lineages do not intersect.

This captures derivative-source duplication.

### IND-R — reporter independence

Two evidence items are independent if they have identified, distinct reporters.

This captures independence of testimony, not necessarily event or documentary origin.

### IND-I — incident independence

Two evidence items are independent if they refer to identified, distinct incidents/events.

This captures repeated occurrence, not necessarily observer or source independence.

## Research questions

### RQ-A
Can distinct source nodes produce corroboration under IND-S while failing under IND-L?

### RQ-B
Can distinct reporters satisfy IND-R while describing only one incident and therefore fail IND-I?

### RQ-C
Can distinct incidents satisfy IND-I while being reported by one reporter and therefore fail IND-R?

### RQ-D
Can reporter independence and lineage independence disagree?

### RQ-E
Are structures satisfying all IND-L + IND-R + IND-I jointly reachable?

## Gate C candidate criterion

Gate C receives a provisional PASS if:

1. at least one classification divergence is mechanically generated;
2. the divergence is non-vacuous;
3. the divergence depends on provenance/report/event relations rather than primitive type mismatch;
4. the result survives scope 8 and scope 10;
5. at least one second solver reproduces SAT/UNSAT classification where available;
6. the interpretation is phrased as **semantic sensitivity**, not as proof that IND-L is universally correct.

## Required runs

Primary:
- Alloy 6.2.0
- SAT4J
- scope 6

Replication:
- SAT4J scope 8
- SAT4J scope 10

Solver replication:
- MiniSat or Glucose if operational on the VPS
- scope 6 at minimum

## Required artifact table

For every command record:

- independence semantics involved;
- SAT/UNSAT;
- scope;
- solver;
- minimal atom count if available;
- whether same evidence structure changes classification;
- researcher interpretation.

## Expected scientifically interesting outcomes

### Outcome O1
IND-S says corroborated, IND-L says not corroborated.

Interpretation:
source multiplicity can overcount derivative evidence.

### Outcome O2
IND-R says corroborated, IND-I says not corroborated.

Interpretation:
multiple observers do not necessarily imply multiple independent incidents.

### Outcome O3
IND-I says corroborated, IND-R says not corroborated.

Interpretation:
repeated incidents can still be dependent on a single observer.

### Outcome O4
No strongly independent structure is reachable.

Interpretation:
the model may be overconstrained or underspecified; investigate before any claim.

### Outcome O5
All rival definitions classify all reachable structures identically.

Interpretation:
the independence-sensitivity hypothesis fails under the model; Gate C does not pass via this route.

## Scientific caution

The experiment can establish that classifications are sensitive to operational definitions.

It cannot, by itself, establish which definition corresponds to “true epistemic independence” in all domains.
