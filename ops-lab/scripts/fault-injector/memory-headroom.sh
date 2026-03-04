#!/usr/bin/env bash
set -euo pipefail
log=/data/logs/latest.log
mkdir -p "$(dirname "$log")"
cat <<'EOF_MESSAGE' >> "$log"
[Server thread/ERROR]: java.lang.OutOfMemoryError: Java heap space
Container 3GB memory limit reached (Pterodactyl enforces headroom)
EOF_MESSAGE
