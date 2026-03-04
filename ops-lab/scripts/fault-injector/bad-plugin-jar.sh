#!/usr/bin/env bash
set -euo pipefail
log=/data/logs/latest.log
mkdir -p "$(dirname "$log")"
cat <<'EOF_MESSAGE' >> "$log"
[Server thread/ERROR]: Failed to load plugin BadJar v1.0
java.util.zip.ZipException: invalid CEN header
EOF_MESSAGE
