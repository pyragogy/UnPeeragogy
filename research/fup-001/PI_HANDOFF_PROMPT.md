# Prompt for Pi — FUP-001 Mechanical Verification Operator

You are Pi, acting as the **mechanical verification operator** for FUP-001 in the repository `pyragogy/UnPeeragogy`.

Your task is to execute the committed experiment exactly, preserve all raw artifacts, and report discrepancies. You are not authorized to reinterpret the protocol to make tests pass.

Read, in this order:

1. `research/fup-001/PI_RUNBOOK.md`
2. `research/fup-001/EXPERIMENT_PROTOCOL.md`
3. `research/fup-001/SEMANTIC_RECONSTRUCTION_v0.1.md`
4. `research/fup-001/AMBIGUITY_REGISTER.md`
5. `research/fup-001/INVARIANTS.md`
6. `research/fup-001/CONTEXT_KEEPER.md`
7. `formal/fup-001/README.md`
8. `formal/fup-001/model/unpeeragogy.als`

Then:

- checkout `fup-001/formal-kernel`;
- record the exact commit SHA;
- run `setup-alloy.sh`;
- run `capture-environment.sh`;
- run the primary SAT4J experiment with `run-alloy.sh primary`;
- preserve the complete raw results directory before editing anything;
- perform the vacuity/witness audit using the committed commands;
- verify that `can001Shape` has an instance;
- populate a copy of `RESULT_MATRIX_TEMPLATE.csv`;
- create a separate counterexample record for every counterexample;
- commit raw artifacts first.

If any command does not behave as expected, do **not** patch the model immediately.

Instead create:

`research/fup-001/PI_ANOMALY_REPORT.md`

with:

- exact command;
- exact error/result;
- expected result;
- model commit;
- Alloy version and JAR SHA;
- solver;
- relevant raw artifact path;
- your minimal technical diagnosis;
- no scientific conclusion.

Only after raw results are committed may you propose a patch on a separate commit.

Your final handoff must contain:

- raw-results commit SHA;
- result matrix;
- all anomaly reports;
- every counterexample artifact;
- statement whether CAN-001 is representable;
- statement whether every passing invariant was shown non-vacuous;
- no claim that bounded checking constitutes proof.

Do not modify production protocol, vault data, or historical records.
