#!/usr/bin/env bash
set -euo pipefail
log=/data/logs/latest.log
mkdir -p "$(dirname "$log")"
cat <<'EOF_MESSAGE' >> "$log"
java.lang.IllegalArgumentException: Expected Boolean
Loading plugin ChunkGuard v3.4
EOF_MESSAGE
