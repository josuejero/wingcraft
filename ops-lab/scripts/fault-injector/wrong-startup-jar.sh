#!/usr/bin/env bash
set -euo pipefail
log=/data/logs/latest.log
mkdir -p "$(dirname "$log")"
cat <<'EOF_MESSAGE' >> "$log"
Error: Unable to access jarfile /data/paper-server-old.jar
[init script] Starting server with NO_FILE permission
EOF_MESSAGE
