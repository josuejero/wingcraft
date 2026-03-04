#!/usr/bin/env bash
set -euo pipefail
log=/data/logs/latest.log
mkdir -p "$(dirname "$log")"
cat <<'EOF_MESSAGE' >> "$log"
This world was saved with Minecraft 1.20.4
This server supports up to 1.19.4
EOF_MESSAGE
