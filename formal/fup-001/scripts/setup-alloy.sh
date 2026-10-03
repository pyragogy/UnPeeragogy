#!/usr/bin/env bash
set -euo pipefail

VERSION="6.2.0"
TOOLS_DIR=".tools"
JAR="$TOOLS_DIR/alloy-$VERSION.jar"
URL="https://github.com/AlloyTools/org.alloytools.alloy/releases/download/v$VERSION/org.alloytools.alloy.dist.jar"

mkdir -p "$TOOLS_DIR"

if ! command -v java >/dev/null 2>&1; then
  echo "ERROR: java not found. Alloy 6.2.0 requires Java 17+."
  exit 2
fi

JAVA_MAJOR="$(java -version 2>&1 | sed -n '1s/.*version "\([0-9][0-9]*\).*/\1/p')"
if [[ -z "$JAVA_MAJOR" || "$JAVA_MAJOR" -lt 17 ]]; then
  echo "ERROR: Java 17+ required. Detected: $(java -version 2>&1 | head -n 1)"
  exit 2
fi

if [[ ! -f "$JAR" ]]; then
  echo "Downloading official Alloy $VERSION distribution..."
  if command -v curl >/dev/null 2>&1; then
    curl -fL "$URL" -o "$JAR"
  elif command -v wget >/dev/null 2>&1; then
    wget -O "$JAR" "$URL"
  else
    echo "ERROR: curl or wget required."
    exit 2
  fi
fi

echo "Alloy JAR: $JAR"
sha256sum "$JAR"
java -jar "$JAR" help | head -n 80
