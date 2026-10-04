#!/usr/bin/env bash
set -euo pipefail

SCOPE="${1:-6}"
SOLVER="${2:-sat4j}"
LABEL="${3:-gate-e}"

case "$SCOPE" in 6|8|10) ;; *) echo "scope must be 6, 8, or 10"; exit 2;; esac

BASE="formal/fup-001/model/historical-replay.als"
JAR=".tools/alloy-6.2.0.jar"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="formal/fup-001/results/gate-e/${STAMP}-${LABEL}-s${SCOPE}-${SOLVER}"
MODEL="$OUT/historical-replay-s${SCOPE}.als"

[[ -f "$BASE" && -f "$JAR" ]] || exit 2
mkdir -p "$OUT"
sed "s/ for 6$/ for $SCOPE/" "$BASE" > "$MODEL"

COUNT="$(grep -Ec '^(check|run) ' "$BASE")"
[[ "$COUNT" -eq 4 ]] || { echo "ERROR expected 4 commands, got $COUNT"; exit 3; }

{
 echo "experiment=E5-historical-replay"
 echo "commit=$(git rev-parse HEAD)"
 echo "scope=$SCOPE"
 echo "solver=$SOLVER"
 echo "model_sha256=$(sha256sum "$MODEL" | awk '{print $1}')"
 echo "alloy_jar_sha256=$(sha256sum "$JAR" | awk '{print $1}')"
} > "$OUT/manifest.txt"

java -jar "$JAR" commands "$MODEL" > "$OUT/commands.txt" 2>&1

set +e
java -Djava.awt.headless=true -jar "$JAR" exec -f -s "$SOLVER" -t json -c '*' -o "$OUT/solutions" "$MODEL" > "$OUT/stdout.txt" 2> "$OUT/stderr.txt"
STATUS=$?
set -e

echo "$STATUS" > "$OUT/exit-code.txt"
[[ "$STATUS" -eq 0 ]] || exit "$STATUS"
echo "$OUT"
