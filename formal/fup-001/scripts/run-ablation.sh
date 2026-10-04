#!/usr/bin/env bash
# FUP-001 Independence Ablation Runner
# Usage: bash formal/fup-001/scripts/run-ablation.sh <variant> <scope> [solver]
#   variant = L | R | I
#   scope   = 6 | 8 | 10
#   solver  = sat4j | glucose | minisat (default: sat4j)
set -euo pipefail

VARIANT="${1:?variant (L|R|I)}"
SCOPE="${2:?scope (6|8|10)}"
SOLVER="${3:-sat4j}"
LABEL="abl-${VARIANT}-scope${SCOPE}-${SOLVER}"

BASE_MODEL="formal/fup-001/model/unpeeragogy.als"
MODEL_L="formal/fup-001/model/unpeeragogy-abl-L.als"
MODEL_R="formal/fup-001/model/unpeeragogy-abl-R.als"
MODEL_I="formal/fup-001/model/unpeeragogy-abl-I.als"
JAR=".tools/alloy-6.2.0.jar"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_ID="${STAMP}-${LABEL}"
OUT="formal/fup-001/results/raw/${RUN_ID}"

case "$VARIANT" in
  L) SRC_MODEL="$MODEL_L" ;;
  R) SRC_MODEL="$MODEL_R" ;;
  I) SRC_MODEL="$MODEL_I" ;;
  *) echo "ERROR: variant must be L, R, or I"; exit 2 ;;
esac

if [[ ! -f "$JAR" ]]; then
  echo "ERROR: missing $JAR. Run setup-alloy.sh first."
  exit 2
fi

if [[ ! -f "$SRC_MODEL" ]]; then
  echo "ERROR: missing model $SRC_MODEL"
  exit 2
fi

mkdir -p "$OUT"

# If scope is 6 and the model already has scope 6 commands, use it directly.
# Otherwise, create a temporary model with the requested scope.
if [[ "$SCOPE" == "6" ]]; then
  MODEL="$SRC_MODEL"
else
  TMPDIR="$OUT/tmp"
  mkdir -p "$TMPDIR"
  TMPMODEL="$TMPDIR/ablation-model.als"
  # Copy the model text, then replace 'for 6' with 'for <SCOPE>' in all commands.
  # We do this by replacing the trailing scope integer on check/run lines.
  sed -E "s/(for[[:space:]]+)[0-9]+/\1${SCOPE}/g" "$SRC_MODEL" > "$TMPMODEL"
  MODEL="$TMPMODEL"
fi

{
  echo "run_id=$RUN_ID"
  echo "captured_at_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "commit=$(git rev-parse HEAD)"
  echo "branch=$(git rev-parse --abbrev-ref HEAD)"
  echo "variant=$VARIANT"
  echo "scope=$SCOPE"
  echo "solver=$SOLVER"
  echo "model=$MODEL"
  echo "model_sha256=$(sha256sum "$MODEL" | awk '{print $1}')"
  echo "alloy_jar_sha256=$(sha256sum "$JAR" | awk '{print $1}')"
  echo "output_type=json"
  echo "parent_run=20261004T065836Z-primary"
  echo "parent_model_commit=8939f8c047de8cacffe1a68d8204ff69d6f46ff0"
} > "$OUT/manifest.txt"

java -jar "$JAR" solvers > "$OUT/solvers.txt" 2>&1 || true

set +e
java -Djava.awt.headless=true -jar "$JAR" exec \
  -f -s "$SOLVER" -t json -c '*' -o "$OUT/solutions" "$MODEL" \
  > "$OUT/stdout.txt" 2> "$OUT/stderr.txt"
STATUS=$?
set -e

echo "$STATUS" > "$OUT/exit-code.txt"

if [[ "$STATUS" -ne 0 ]]; then
  echo "Alloy execution failed with exit code $STATUS"
  echo "Inspect: $OUT/stderr.txt"
fi

echo "Run complete: $OUT"
echo "Do not interpret results before preserving this directory in git."