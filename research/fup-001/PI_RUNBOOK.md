# FUP-001 — Pi Execution Runbook

**Purpose:** hand off the first mechanical verification cycle without transferring scientific judgment to the executing agent.

Pi's role is **experimental operator + artifact collector**, not paper author and not epistemic authority.

## 0. Non-negotiable rules

Pi MUST:

1. run the exact committed model before editing it;
2. record environment metadata before any execution;
3. preserve raw stdout/stderr;
4. preserve every generated counterexample/instance;
5. never rewrite an unexpected result into an expected one;
6. never call “no counterexample found in bounded scope” a proof;
7. never silently change scope, solver or model;
8. commit raw results separately from interpretation;
9. stop and flag parser/model errors rather than improvising semantics.

Pi MUST NOT change production UnPeeragogy files during this cycle.

## 1. Checkout

```bash
git clone https://github.com/pyragogy/UnPeeragogy.git
cd UnPeeragogy
git fetch origin
git checkout fup-001/formal-kernel
git status
```

Record the exact commit:

```bash
git rev-parse HEAD
```

## 2. Environment

Required baseline:

- Linux VPS
- Java 17+
- Alloy 6.2.0 official distribution JAR
- SAT4J baseline solver

Run:

```bash
bash formal/fup-001/scripts/setup-alloy.sh
bash formal/fup-001/scripts/capture-environment.sh
```

Do not use a different Alloy version for the primary run.

A second solver/version may be used only as a replication run and must be placed in a separate result directory.

## 3. Smoke test

Before running FUP-001:

```bash
java -jar .tools/alloy-6.2.0.jar help
```

Save output.

Then parse/execute the committed model without editing it.

## 4. Primary run

```bash
bash formal/fup-001/scripts/run-alloy.sh primary
```

The script must create a timestamped run directory under:

`formal/fup-001/results/raw/`

Do not overwrite previous runs.

## 5. Expected classifications

### Assertions expected to find NO counterexample within the configured scope

- `AutomationCannotAccept`
- `CorroboratedCannotBeSyntheticOnly`
- `VerifiedCannotUseOnlyUntraceableEvidence`
- `RevisedHasHistory`

### Assertions expected to produce a counterexample

- `Naive_DistinctSourcesAreIndependent`
- `Naive_AcceptedImpliesGateBMutation`
- `Naive_AcceptedImpliesCorroborated`
- `Naive_EnginePassedImpliesAccepted`
- `Naive_VerificationContestedImpliesHumanContested`

### Predicates expected to have an instance

- `acceptedWithGateBNoChange`
- `gateAAcceptedBeforeGateBDecision`
- `sharedOriginDifferentSources`
- `acceptedButNotCorroborated`

An expected result is not automatically a correct result. Pi records; the researcher interprets.

## 6. Vacuity audit

After the primary assertions, run the witness model:

`formal/fup-001/model/vacuity.als`

Every antecedent of a “holding” assertion must have at least one satisfying instance.

If, for example, `AutomationCannotAccept` passes only because there are no HumanDecision instances, the result is vacuous and scientifically useless.

Record each property as:

- NON_VACUOUS_PASS
- COUNTEREXAMPLE
- VACUOUS_PASS
- PARSE_ERROR
- EXECUTION_ERROR
- UNCLASSIFIED

## 7. Counterexample capture

For every counterexample record:

- command name;
- model commit SHA;
- Alloy version;
- solver;
- scope;
- satisfiable/unsatisfiable result;
- raw instance representation;
- minimum relevant atoms/relations;
- whether the counterexample is expected;
- whether it reflects a protocol problem, a modelling assumption, or a model bug;
- human interpretation left blank for later review.

Use `results/COUNTEREXAMPLE_TEMPLATE.md`.

## 8. CAN-001 regression

Confirm that the model admits a configuration representing:

- human review = ACCEPTED;
- engine need not be ENGINE_PASSED;
- Gate B = NO_CHANGE;
- Gate A and Gate B are represented as separate decision records.

If the model cannot represent this, classify the model as **historically inconsistent** and stop Gate C.

## 9. Independence experiment

Do not improvise this on the first run.

After baseline results are committed, run the three predeclared variants:

1. lineage independence;
2. reporter independence;
3. incident independence.

The purpose is not to select the variant that gives the nicest answer. Record classification changes across definitions.

## 10. Commit discipline

Commit raw experimental artifacts first:

```bash
git add formal/fup-001/results
git commit -m "formal: record Alloy baseline run <RUN-ID>"
```

Only after raw results are immutable should an interpretation report be added.

## 11. Stop conditions

Stop and report rather than “fix” if:

- Alloy cannot parse the model;
- the exact committed model requires semantic edits;
- an expected invariant has a counterexample;
- an expected counterexample cannot be generated;
- CAN-001 cannot be represented;
- environment capture is incomplete;
- output cannot be tied to a commit SHA.

These are research findings, not operational inconveniences.

## 12. Handoff back to researcher

Pi returns exactly:

1. run directory path;
2. commit SHA containing raw results;
3. one-line status for every command;
4. any parser/runtime errors verbatim;
5. no rewritten scientific conclusion.

The research orchestrator then performs Gate B/C interpretation.
