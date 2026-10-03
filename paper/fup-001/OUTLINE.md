# Prospective Paper Architecture — FUP-001

**Working title:** Formalising Evidence-Governed Epistemic Transitions in Human–AI Knowledge Systems

**Status:** architecture only. Do not turn into a manuscript until Gate C passes.

## 1. Introduction

Problem:
human–AI knowledge systems increasingly automate evidence acquisition, synthesis and proposal generation, while epistemic authority and publication decisions may remain human-governed.

Gap to test:
ordinary schemas and workflow code can validate data shape without validating whether an epistemic transition is admissible.

Candidate research question:
Can evidence-governance protocols be formalised so that invalid epistemic transitions become mechanically detectable?

Potential contributions, conditional on results:

1. a multi-axis formal model separating machine processing, human validation, evidential status and publication authority;
2. counterexamples showing failure modes created by collapsing those axes;
3. a provenance-aware treatment of evidential independence;
4. historical replay demonstrating model/protocol co-refinement.

## 2. Background and Related Work

Planned clusters:

- lightweight formal methods and Alloy;
- executable specifications / model finding;
- provenance and W3C PROV;
- evidence graphs / knowledge provenance;
- human–AI decision governance;
- epistemic status and defeasible/revisable knowledge;
- reproducible computational research;
- formalisation of socio-technical workflows.

Avoid claiming novelty until a systematic related-work search is complete.

## 3. Case Substrate: UnPeeragogy

Describe only what is necessary:

- open qualitative research substrate;
- evidence taxonomy;
- acquisition channels;
- Perturbator;
- Gate A / Gate B;
- machine-readable provenance;
- human-review ledger.

Pyragogy/UnPeeragogy should appear as the **research substrate and artifact**, not promotional branding.

## 4. Semantic Reconstruction

Core finding:
the protocol is not one state machine but a product of orthogonal governance dimensions.

Explain:

- acquisition;
- engine processing;
- human review;
- epistemic lifecycle;
- verification;
- integrity;
- publication decision.

Document semantic ambiguities rather than hiding them.

## 5. Formal Model

- Alloy 6.2.0;
- signatures and relations;
- provenance/source lineage;
- human decisions;
- Gate B decisions;
- revision lineage;
- assumptions vs repository-grounded constraints;
- bounded scopes.

## 6. Verification Questions

RQ1: Can automation acquire substantive human epistemic authority accidentally?

RQ2: What invalid implications arise if independent state axes are collapsed?

RQ3: Can duplicated/derived source lineage manufacture apparent corroboration?

RQ4: Does the operational definition of independence materially change epistemic classification?

RQ5: Can the model replay real historical governance decisions?

## 7. Results

Populate only from committed solver output.

Required tables:

- assertion result matrix;
- vacuity audit;
- counterexample taxonomy;
- scope/solver replication;
- independence ablation;
- historical replay cases.

## 8. CAN-001 Historical Replay

Use as first model/protocol co-refinement example:

- Gate A ACCEPTED;
- engine verdict absent;
- Gate B NO_CHANGE;
- discovery that binary publication modelling was insufficient;
- schema/operational-record mismatch around `publication_review`.

## 9. Discussion

Potential themes, only if supported:

- epistemic authority is not processing success;
- corroboration is not URL multiplicity;
- human override must be auditable rather than magical;
- formalisation exposes category errors before it proves properties;
- historical replay can refine formal semantics.

## 10. Threats to Validity

Must include:

- bounded model checking;
- model abstraction;
- single-project substrate;
- semantics introduced by researchers;
- independence definition sensitivity;
- limited historical cases;
- researcher positionality;
- AI involvement in model generation;
- risk of confirmation bias in choosing invariants.

## 11. Reproducibility

Provide:

- repository commit;
- Alloy version/JAR hash;
- Java version;
- solver;
- model;
- commands;
- raw results;
- case inputs;
- AI-use log.

## 12. Conclusion

Do not conclude that UnPeeragogy is “correct”.

Preferred shape:
formalising evidence governance can make category errors and invalid state transitions inspectable; the exact strength of that claim depends on Gate C/D/E results.
