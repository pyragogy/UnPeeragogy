#!/usr/bin/env bash
set -euo pipefail

OUT="formal/fup-001/results/environment"
mkdir -p "$OUT"

{
  echo "captured_at_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "git_commit=$(git rev-parse HEAD)"
  echo "git_branch=$(git rev-parse --abbrev-ref HEAD)"
  echo "git_dirty=$(if git diff --quiet && git diff --cached --quiet; then echo false; else echo true; fi)"
  echo "kernel=$(uname -a)"
  echo "arch=$(uname -m)"
  echo "java=$(java -version 2>&1 | tr '\n' ' ')" 
} > "$OUT/environment.txt"

if [[ -f .tools/alloy-6.2.0.jar ]]; then
  sha256sum .tools/alloy-6.2.0.jar > "$OUT/alloy-jar.sha256"
  java -jar .tools/alloy-6.2.0.jar help > "$OUT/alloy-help.txt" 2>&1 || true
else
  echo "MISSING .tools/alloy-6.2.0.jar" > "$OUT/alloy-jar.sha256"
fi

git status --short > "$OUT/git-status.txt"
git log -1 --format=fuller > "$OUT/git-head.txt"

cat "$OUT/environment.txt"
