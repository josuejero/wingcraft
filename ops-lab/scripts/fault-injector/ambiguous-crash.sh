#!/usr/bin/env bash
set -euo pipefail
log=/data/logs/latest.log
mkdir -p "$(dirname "$log")"
cat <<'EOF_MESSAGE' >> "$log"
The server has stopped responding. This crash report has been saved.
Escalate to platform: insufficient evidence to determine root cause.
EOF_MESSAGE
