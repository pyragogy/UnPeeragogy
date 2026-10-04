# PI Anomaly Report — FUP-001 Baseline Run

## Anomaly A-001: Missing `vacuity.als`

| Field | Value |
|-------|-------|
| **Exact command** | The runbook §6 specifies: `run the witness model: formal/fup-001/model/vacuity.als` |
| **Exact error/result** | File `formal/fup-001/model/vacuity.als` does not exist on branch `fup-001/formal-kernel` at commit `8939f8c` |
| **Expected result** | A separate Alloy model with vacuity-checking runs for every holding assertion's antecedent |
| **Model commit** | `8939f8c047de8cacffe1a68d8204ff69d6f46ff0` |
| **Alloy version / JAR SHA** | 6.2.0 / `6b8c1cb5bc93bedfc7c61435c4e1ab6e688a242dc702a394628d9a9801edb78d` |
| **Solver** | SAT4J |
| **Relevant raw artifact path** | `formal/fup-001/model/unpeeragogy.als` (contains inline witness predicates) |
| **Minimal technical diagnosis** | The vacuity witnesses are inlined in the primary model (`witnessSubstantiveHumanDecision`, `witnessCorroboratedCandidate`, `witnessVerifiedCandidate`, `witnessRevisedInterpretation`). A separate `vacuity.als` may have been planned but was never committed. The inlined witnesses serve the same function and all returned SAT, so the vacuity audit is functionally complete. However, the runbook contract is violated — a referenced file does not exist. |

## Anomaly A-002: `stdout.txt` empty

| Field | Value |
|-------|-------|
| **Exact command** | `run-alloy.sh primary` |
| **Exact error/result** | `stdout.txt` is empty (0 bytes) |
| **Expected result** | Alloy `exec` CLI expected to produce solver output on stdout; instead all progress/result info appears on stderr |
| **Model commit** | `8939f8c047de8cacffe1a68d8204ff69d6f46ff0` |
| **Alloy version / JAR SHA** | 6.2.0 / `6b8c1cb5bc93bedfc7c61435c4e1ab6e688a242dc702a394628d9a9801edb78d` |
| **Solver** | SAT4J |
| **Relevant raw artifact path** | `formal/fup-001/results/raw/20261004T065836Z-primary/stdout.txt`, `stderr.txt` |
| **Minimal technical diagnosis** | Alloy 6.2.0 `exec` CLI writes solver progress to stderr and leaves stdout empty when `-t json` output is directed to `-o`. This is tool behaviour, not a failure. All data is recoverable from the `receipt.json` and solution JSON files. No data loss. |

## Anomaly A-003: Dirty working tree during capture

| Field | Value |
|-------|-------|
| **Exact command** | `capture-environment.sh` |
| **Exact result** | `git_dirty=true` |
| **Expected result** | Clean working tree |
| **Model commit** | `8939f8c047de8cacffe1a68d8204ff69d6f46ff0` |
| **Alloy version / JAR SHA** | 6.2.0 / `6b8c1cb5bc93bedfc7c61435c4e1ab6e688a242dc702a394628d9a9801edb78d` |
| **Solver** | SAT4J |
| **Relevant raw artifact path** | `formal/fup-001/results/environment/git-status.txt` |
| **Minimal technical diagnosis** | File `runs/human-review-ledger.yaml` was already dirty before checkout (present before the branch switch). This is pre-existing local modification unrelated to FUP-001. No model files affected. |