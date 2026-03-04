#!/usr/bin/env bash
set -euo pipefail
log=/data/logs/latest.log
mkdir -p "$(dirname "$log")"
cat <<'EOF_MESSAGE' >> "$log"
Failed to bind to 0.0.0.0 because Docker assigned 10.0.0.5
Connection refused when probing 127.0.0.1
EOF_MESSAGE
