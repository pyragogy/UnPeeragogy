#!/usr/bin/env bash
set -euo pipefail

LABEL="${1:-primary}"
MODEL="formal/fup-001/model/unpeeragogy.als"
JAR=".tools/alloy-6.2.0.jar"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_ID="${STAMP}-${LABEL}"
OUT="formal/fup-001/results/raw/${RUN_ID}"

if [[ ! -f "$JAR" ]]; then
  echo "ERROR: missing $JAR. Run setup-alloy.sh first."
  exit 2
fi

if [[ ! -f "$MODEL" ]]; then
  echo "ERROR: missing model $MODEL"
  exit 2
fi

mkdir -p "$OUT"

{
  echo "run_id=$RUN_ID"
  echo "captured_at_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "commit=$(git rev-parse HEAD)"
  echo "branch=$(git rev-parse --abbrev-ref HEAD)"
  echo "model=$MODEL"
  echo "model_sha256=$(sha256sum "$MODEL" | awk '{print $1}')"
  echo "alloy_jar_sha256=$(sha256sum "$JAR" | awk '{print $1}')"
  echo "solver=sat4j"
  echo "output_type=json"
} > "$OUT/manifest.txt"

java -jar "$JAR" solvers > "$OUT/solvers.txt" 2>&1 || true
java -jar "$JAR" help exec > "$OUT/exec-help.txt" 2>&1 || true

set +e
java -Djava.awt.headless=true -jar "$JAR" exec   -f   -s sat4j   -t json   -c '*'   -o "$OUT/solutions"   "$MODEL"   > "$OUT/stdout.txt" 2> "$OUT/stderr.txt"
STATUS=$?
set -e

echo "$STATUS" > "$OUT/exit-code.txt"

if [[ "$STATUS" -ne 0 ]]; then
  echo "Alloy execution failed with exit code $STATUS"
  echo "Inspect: $OUT/stderr.txt"
  exit "$STATUS"
fi

echo "Run complete: $OUT"
echo "Do not interpret results before preserving this directory in git."
