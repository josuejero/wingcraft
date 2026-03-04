#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

docker compose logs --tail 80 paper > logs/evidence.log

docker inspect paper > logs/inspect.json
