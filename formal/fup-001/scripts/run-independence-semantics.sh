#!/usr/bin/env bash
set -euo pipefail

SCOPE="${1:-6}"
SOLVER="${2:-sat4j}"
LABEL="${3:-semantic}"

case "$SCOPE" in
  6|8|10) ;;
  *) echo "ERROR: supported scopes are 6, 8, 10"; exit 2 ;;
esac

BASE="formal/fup-001/model/independence-semantics.als"
JAR=".tools/alloy-6.2.0.jar"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_ID="${STAMP}-${LABEL}-s${SCOPE}-${SOLVER}"
OUT="formal/fup-001/results/semantic-ablation/${RUN_ID}"
MODEL="$OUT/independence-semantics-s${SCOPE}.als"

[[ -f "$JAR" ]] || { echo "ERROR: missing $JAR"; exit 2; }
[[ -f "$BASE" ]] || { echo "ERROR: missing $BASE"; exit 2; }

mkdir -p "$OUT"
sed "s/ for 6$/ for $SCOPE/" "$BASE" > "$MODEL"

{
  echo "experiment=E3-same-structure-independence-semantics"
  echo "run_id=$RUN_ID"
  echo "commit=$(git rev-parse HEAD)"
  echo "scope=$SCOPE"
  echo "solver=$SOLVER"
  echo "canonical_model_sha256=$(sha256sum "$BASE" | awk '{print $1}')"
  echo "executed_model_sha256=$(sha256sum "$MODEL" | awk '{print $1}')"
  echo "alloy_jar_sha256=$(sha256sum "$JAR" | awk '{print $1}')"
} > "$OUT/manifest.txt"

COUNT="$(grep -Ec '^(check|run) ' "$BASE")"
[[ "$COUNT" -eq 10 ]] || { echo "ERROR: expected 10 canonical commands, found $COUNT"; exit 3; }

java -jar "$JAR" commands "$MODEL" > "$OUT/commands.txt" 2>&1

set +e
java -Djava.awt.headless=true -jar "$JAR" exec -f -s "$SOLVER" -t json -c '*' -o "$OUT/solutions" "$MODEL" > "$OUT/stdout.txt" 2> "$OUT/stderr.txt"
STATUS=$?
set -e

echo "$STATUS" > "$OUT/exit-code.txt"
[[ "$STATUS" -eq 0 ]] || exit "$STATUS"
echo "Completed $RUN_ID"
