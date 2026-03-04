#!/usr/bin/env bash
set -euo pipefail
log=/data/logs/latest.log
mkdir -p "$(dirname "$log")"
cat <<'EOF_MESSAGE' >> "$log"
Wrapper failed: required environment variable WORLD_NAME is not set
Error: Unable to find world folder
EOF_MESSAGE
