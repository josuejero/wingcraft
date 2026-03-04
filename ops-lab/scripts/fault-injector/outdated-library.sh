#!/usr/bin/env bash
set -euo pipefail
log=/data/logs/latest.log
mkdir -p "$(dirname "$log")"
cat <<'EOF_MESSAGE' >> "$log"
Loading plugin LegacyNetBridge v2.3.1
java.lang.NoClassDefFoundError: io.netty.channel.ChannelFuture
EOF_MESSAGE
