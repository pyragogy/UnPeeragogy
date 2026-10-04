# FUP-001 — A2 Historical Audit

## Status

**PARTIAL COMPLETE — external source verification added**

Purpose: re-check the historical substrate independently of the FUP-001 interpretive summaries.

## CAN-001

The repository reconstruction records:

- Gate A ACCEPTED;
- engine verdict absent;
- Gate B NO_CHANGE;
- separate `publication_review`.

This remains the strongest case for the separation of processing, human review and publication authority.

Limitation:
the current audit runtime could not independently retrieve the public GitHub Discussion page through the available connector/web path. Therefore CAN-001 remains repository-backed rather than independently web-reconstructed in A2.

Status: **SUPPORTED FROM REPOSITORY RECORD / EXTERNAL REFETCH INCOMPLETE**

## CAN-002 — Wikipedia Adventure

External sources independently confirm that the cited documents are not three independent studies.

Primary project page:
https://meta.wikimedia.org/wiki/Research:Impact_of_The_Wikipedia_Adventure_on_new_editor_retention

The Meta-Wiki page identifies the project, authors/collaborators and directly cites:

- the CSCW 2017 paper;
- the open PDF/preprint of that paper.

Paper:
https://doi.org/10.1145/2998181.2998307

Therefore:
- Meta research page;
- DOI;
- open PDF

are multiple representations/publication locations of one research programme/paper, not independent corroborating studies.

### Correction to prior inventory

CAN-002 should also be considered relevant to HE-04-style provenance duplication.

Supported historical statement:

> Multiple documentary references can resolve to one underlying study/evidential lineage.

This is stronger than merely saying CAN-002 is PENDING.

Status: **SUPPORTED**

## CAN-003 — Wikipedia Teahouse

External sources confirm a strong relationship between the Meta research project and OpenSym paper.

Meta project page:
https://meta.wikimedia.org/wiki/Research:Teahouse_long_term_new_editor_retention

It identifies:
- Jonathan Morgan as contact;
- Aaron Halfaker as collaborator;
- the Wikimedia Foundation;
- the experimental sampling and retention analysis.

OpenSym paper page:
https://opensym.org/blog/2020/01/22/evaluating-the-impact-of-the-wikipedia-teahouse-on-newcomer-socialization-and-retention/

It identifies:
- Jonathan T. Morgan;
- Aaron Halfaker;
- the Teahouse retention experiment.

The project page also links the resulting publication.

Therefore the project's own warning that research pages and paper share authors/data is externally plausible and directly supported at least at the project/publication level.

### Important boundary

External verification supports:
- shared investigators;
- project-to-paper continuity;
- reuse of the same research programme/data collection.

It does not justify an invented complete provenance DAG among every URL.

Status: **SUPPORTED WITH BOUNDED LINEAGE CLAIM**

## Cross-case result

Both CAN-002 and CAN-003 demonstrate a practical provenance pattern:

```
multiple URLs / document nodes
        !=
multiple independent studies / evidential origins
```

This is historically real in the substrate.

However, prior literature already treats provenance dependence and source independence explicitly. Therefore this result strengthens the case-study validity of FUP-001 but not its novelty.

## Historical gaps

Still absent:

- a naturally occurring CONTESTED / REVISE transition;
- an AI-assisted acquisition case;
- a real case with partial dependence rather than clear project/publication identity;
- a case where rival independence policies produce an actual disputed human governance decision.

These gaps should guide future UnPeeragogy instrumentation, but cases must not be manufactured simply to satisfy the research design.

## A2 verdict

**SUPPORTED CASE SUBSTRATE, LIMITED GENERALISABILITY**

The historical component is real enough to justify continued research.

It is not sufficient by itself to establish a general theory of epistemic governance.
