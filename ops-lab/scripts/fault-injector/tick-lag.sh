#!/usr/bin/env bash
set -euo pipefail
log=/data/logs/latest.log
mkdir -p "$(dirname "$log")"
cat <<'EOF_MESSAGE' >> "$log"
[23:12:01] [Server thread/WARN]: Can't keep up! Is the server overloaded? Running 2000ms or more behind, skipping 40 tick(s)
[23:12:01] [Server thread/ERROR]: Can't keep up! The server is overloaded and players may experience lag.
EOF_MESSAGE
