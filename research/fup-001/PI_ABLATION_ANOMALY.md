# PI Ablation Anomaly

## A-004: Missing PI_ABLATION_PROMPT.md

The file `research/fup-001/PI_ABLATION_PROMPT.md` does not exist on branch
`fup-001/formal-kernel` at commit `8939f8c`. The experiment protocol and runbook
do specify the three independence variants (IND-L, IND-R, IND-I) and the scope
escalation plan. These instructions are followed directly from
`EXPERIMENT_PROTOCOL.md` (§9, Independence ablation) and `PI_RUNBOOK.md` (§9).

Variant models are created under `formal/fup-001/model/` as separate files to
avoid modifying the baseline.