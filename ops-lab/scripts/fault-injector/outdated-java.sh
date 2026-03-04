#!/usr/bin/env bash
set -euo pipefail
log=/data/logs/latest.log
mkdir -p "$(dirname "$log")"
cat <<'EOF_MESSAGE' >> "$log"
java.lang.UnsupportedClassVersionError: com/example/Main has been compiled by a more recent version of the Java Runtime (class file version 61.0)
This server requires Java 17
EOF_MESSAGE
