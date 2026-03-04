#!/usr/bin/env bash
set -euo pipefail
log=/data/logs/latest.log
mkdir -p "$(dirname "$log")"
cat <<'EOF_MESSAGE' >> "$log"
Paper encountered an error while reading paper.yml
[Server thread/INFO]: Reloading server (attempt 2/5) after fatal config error
EOF_MESSAGE
