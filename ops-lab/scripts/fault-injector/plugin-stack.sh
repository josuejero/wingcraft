#!/usr/bin/env bash
set -euo pipefail
log=/data/logs/latest.log
mkdir -p "$(dirname "$log")"
cat <<'EOF_MESSAGE' >> "$log"
[23:11:12] [Server thread/ERROR]: Could not pass event PlayerLoginEvent to FaultyPlugin
java.lang.IllegalStateException: Simulated fault during data-sync
    at com.wingcraft.lab.FaultyPlugin.onPlayerJoin(FaultyPlugin.java:48)
    at com.wingcraft.lab.Listener.dispatch(Listener.java:22)
    at org.bukkit.plugin.SimplePluginManager.callEvent(SimplePluginManager.java:579)
EOF_MESSAGE
