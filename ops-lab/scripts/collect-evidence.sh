#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p logs

docker compose logs --no-color --tail 120 paper > "logs/evidence-${timestamp}.log"
docker compose ps paper > "logs/ps-${timestamp}.txt"
docker inspect wingcraft-paper > "logs/inspect-${timestamp}.json"
