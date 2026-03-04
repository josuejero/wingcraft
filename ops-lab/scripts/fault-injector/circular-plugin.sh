#!/usr/bin/env bash
set -euo pipefail
log=/data/logs/latest.log
mkdir -p "$(dirname "$log")"
cat <<'EOF_MESSAGE' >> "$log"
[Server thread/ERROR]: Detected circular dependency between LoopHook and LoopHook
Loading plugin LoopHook v1.0
EOF_MESSAGE
