#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p backups
cp -av logs backups/logs-$(date +%Y%m%dT%H%M%SZ)
