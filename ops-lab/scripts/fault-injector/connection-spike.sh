#!/usr/bin/env bash
set -euo pipefail
log=/data/logs/latest.log
mkdir -p "$(dirname "$log")"
cat <<'EOF_MESSAGE' >> "$log"
[23:12:15] [Netty Epoll Server IO #2/WARN]: java.io.IOException: Connection reset by peer
[23:12:15] [Netty Epoll Server IO #2/WARN]: Disconnected player player123 (connection reset)
EOF_MESSAGE
