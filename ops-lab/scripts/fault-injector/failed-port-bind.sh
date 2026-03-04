#!/usr/bin/env bash
set -euo pipefail
log=/data/logs/latest.log
mkdir -p "$(dirname "$log")"
cat <<'EOF_MESSAGE' >> "$log"
[Server thread/WARN]: Failed to bind to port 25565
Address already in use
EOF_MESSAGE
