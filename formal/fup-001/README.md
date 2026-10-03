# FUP-001 Formal Model

This directory contains the executable formalisation work for FUP-001.

## Model v0.1

`model/unpeeragogy.als` encodes the smallest current relational kernel:

- actors;
- source lineage;
- evidence items;
- candidates;
- engine processing;
- human review;
- epistemic status;
- verification status;
- integrity level;
- Gate B editorial decision state;
- interpretation revision.

The model deliberately does **not** encode the whole UnPeeragogy protocol.

## Three epistemic classes inside the model

Every constraint should be read as one of:

1. **repository-grounded fact** — direct formal translation of an explicit project rule;
2. **formalisation assumption** — necessary to make an underspecified concept executable;
3. **naive rule under attack** — intentionally checked so Alloy can produce a counterexample.

This distinction is part of the research method.

## Expected first results

Assertions expected to hold within the bounded scopes:

- automation cannot ACCEPT a candidate;
- a corroborated candidate cannot be supported only by synthetic material;
- verified integrity cannot consist only of untraceable evidence;
- revised interpretations preserve a predecessor.

Assertions expected to fail:

- distinct source nodes are automatically independent;
- ACCEPTED automatically means Gate B mutation;
- ACCEPTED automatically means epistemically CORROBORATED;
- ENGINE_PASSED automatically means human ACCEPTED;
- verification CONTESTED automatically means human-review CONTESTED.

Expected failures are not test failures. They are counterexample-generation tasks.

## Execution status

CAN-001 has been reconstructed and forced one model revision: Gate B is now an explicit decision process with a real `NO_CHANGE` outcome. The repository model has been written, but this chat runtime currently has Java 21 and no Alloy Analyzer/CLI installed. Therefore **no model-checking result is claimed yet**.

The next Gate B task is to run this exact file with a pinned Alloy 6 release, preserve the Analyzer version and solver, and record every instance/counterexample.

“No counterexample found in scope N” must never be reported as an unrestricted mathematical proof.
