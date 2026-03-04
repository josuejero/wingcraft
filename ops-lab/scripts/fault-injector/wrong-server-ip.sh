#!/usr/bin/env bash
set -euo pipefail
log=/data/logs/latest.log
mkdir -p "$(dirname "$log")"
cat <<'EOF_MESSAGE' >> "$log"
[Server thread/ERROR]: Encountered an error during world load
java.net.BindException: Cannot assign requested address
EOF_MESSAGE
