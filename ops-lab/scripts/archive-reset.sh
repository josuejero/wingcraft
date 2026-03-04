#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
archive_dir="archives/$timestamp"
mkdir -p "$archive_dir"

./scripts/backup.sh "$archive_dir"

echo "Stopping the lab so volumes can be removed..."
docker compose down --volumes --remove-orphans

for volume in wingcraft_paper_logs wingcraft_paper_world wingcraft_paper_configs; do
  docker volume rm "$volume" >/dev/null 2>&1 || true
done

echo "Lab reset complete. Template data archived at $archive_dir; run scripts/prepare-scenario.sh <scenario> to reseed."
