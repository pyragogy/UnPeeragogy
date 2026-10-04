#!/usr/bin/env bash
set -euo pipefail

SCOPE="${1:-6}"
SOLVER="${2:-sat4j}"
LABEL="${3:-ablation}"

case "$SCOPE" in
  6|8|10) ;;
  *) echo "ERROR: supported scopes are 6, 8, 10"; exit 2 ;;
esac

BASE="formal/fup-001/model/independence-ablation.als"
JAR=".tools/alloy-6.2.0.jar"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_ID="${STAMP}-${LABEL}-s${SCOPE}-${SOLVER}"
OUT="formal/fup-001/results/ablation/${RUN_ID}"
MODEL="$OUT/independence-ablation-s${SCOPE}.als"

if [[ ! -f "$JAR" ]]; then
  echo "ERROR: missing $JAR"
  exit 2
fi

if [[ ! -f "$BASE" ]]; then
  echo "ERROR: missing $BASE"
  exit 2
fi

mkdir -p "$OUT"

# The canonical model commits scope 6. For replication at 8/10 we preserve
# the exact generated model inside the result directory.
sed "s/ for 6$/ for $SCOPE/" "$BASE" > "$MODEL"

{
  echo "run_id=$RUN_ID"
  echo "captured_at_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "commit=$(git rev-parse HEAD)"
  echo "branch=$(git rev-parse --abbrev-ref HEAD)"
  echo "canonical_model=$BASE"
  echo "canonical_model_sha256=$(sha256sum "$BASE" | awk '{print $1}')"
  echo "executed_model=$MODEL"
  echo "executed_model_sha256=$(sha256sum "$MODEL" | awk '{print $1}')"
  echo "alloy_jar_sha256=$(sha256sum "$JAR" | awk '{print $1}')"
  echo "scope=$SCOPE"
  echo "solver=$SOLVER"
  echo "output_type=json"
} > "$OUT/manifest.txt"

set +e
java -Djava.awt.headless=true -jar "$JAR" exec   -f   -s "$SOLVER"   -t json   -c '*'   -o "$OUT/solutions"   "$MODEL"   > "$OUT/stdout.txt" 2> "$OUT/stderr.txt"
STATUS=$?
set -e

echo "$STATUS" > "$OUT/exit-code.txt"

if [[ "$STATUS" -ne 0 ]]; then
  echo "Ablation failed: scope=$SCOPE solver=$SOLVER exit=$STATUS"
  exit "$STATUS"
fi

echo "Ablation complete: $OUT"
