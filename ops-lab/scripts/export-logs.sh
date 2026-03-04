#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
exports_dir="exports"
mkdir -p "$exports_dir"
docker compose logs --no-color --tail 200 paper > "$exports_dir/log-export-${timestamp}.log"
echo "Exported logs to $exports_dir/log-export-${timestamp}.log"
