# FUP-001 — Scientific Status

**Date:** 2026-10-04  
**Phase:** post E1–E5, pre E6  
**Manuscript status:** FROZEN

## Current answer to the core question

> Have we produced something scientifically serious, or only a sophisticated conversation with AI?

Current answer:

**There is a serious research artifact and a reproducible formal investigation, but a publishable scientific contribution has not yet been established.**

This is neither a rejection nor a paper-readiness decision.

## What is real and defensible now

### 1. Reproducible formal artefacts

The repository contains executable Alloy models, pinned tooling, raw outputs, solver replication and bounded-scope checks.

### 2. Model/protocol co-refinement occurred

CAN-001 forced a revision of the initial publication abstraction by exposing the real `NO_CHANGE` Gate B outcome.

This is a genuine methodological event: historical replay changed the formal model rather than history being rewritten to fit it.

### 3. Governance dimensions are explicitly separated

The formalisation distinguishes processing, human review, epistemic state, verification, integrity and publication authority.

This separation is useful, but its novelty is not established.

### 4. Invalid bridge rules are mechanically inspectable

Examples such as:
- ENGINE_PASSED => ACCEPTED;
- ACCEPTED => CORROBORATED;
- ACCEPTED => publication mutation

can be represented and counterexample-tested.

Again, this is useful formal governance engineering, not yet shown to be a novel scientific contribution.

### 5. Historical provenance concern aligns with the formal problem

CAN-003 records that apparently multiple documentary references share authors/datasets and should not be counted as independent corroboration.

The correspondence is real but should be described as structural alignment, not proof of a universal lineage semantics.

## What has been downgraded

### “Source multiplicity != independence” as a central discovery

Downgraded from potential contribution to **established background / model demonstration**.

### “Lineage independence is orthogonal”

Retain only as a bounded structural result of the tested model.

### “Multiple agents do not mean multiple evidence sources”

Do not present as new. Direct contemporary work already formalises this.

### E1 holding assertions

Regression checks, not discoveries.

## Current strongest research direction

The most promising direction is no longer a theory of provenance independence.

It is:

> **Executable epistemic governance for human–AI knowledge systems: separating authority, evidence state, processing state and publication state, then testing invalid cross-axis transitions through formal counterexamples and historical replay.**

This is a candidate direction, not a final contribution claim.

## Required work before paper decision

### E6 — multidimensional dependence policies

Replace one privileged binary independence predicate with explicit dimensions and transition-specific policies.

### Historical coverage expansion

Seek naturally occurring:
- CONTESTED / REVISE case;
- AI-assisted acquisition case;
- provenance case with partial rather than total dependency.

Do not manufacture cases merely to satisfy coverage.

### Independent reconstruction

A reviewer or separate agent should rebuild at least one model and historical mapping without using the existing interpretation documents.

### Systematic related-work review

The preliminary novelty audit already eliminates several broad novelty claims. A systematic review is required before submission targeting.

### Claim matrix

Only claims surviving:
- formal audit;
- historical audit;
- epistemological audit;
- novelty audit

may enter a manuscript.

## Decision gate

Current outcome:

**B — INTERESTING BUT INCOMPLETE**

Do not write the paper yet.

Use the audit to decide whether:
1. E6/E7 produce a stronger general result; or
2. FUP-001 should primarily drive a redesign of UnPeeragogy; or
3. the publishable contribution is a narrower methods/artifact paper.

## Research integrity rule

The project should prefer a smaller true claim over a larger attractive claim.
