#!/usr/bin/env bash
set -euo pipefail
log=/data/logs/latest.log
mkdir -p "$(dirname "$log")"
cat <<'EOF_MESSAGE' >> "$log"
[Server thread/ERROR]: java.lang.NoSuchMethodError: org.bukkit.event.player.PlayerLoginEvent.getPlayer()
Loading plugin BetterJoin v1.4
EOF_MESSAGE
