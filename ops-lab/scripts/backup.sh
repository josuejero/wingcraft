#!/usr/bin/env bash
set -euo pipefail
dir="$(dirname "$0")/.."
cd "$dir"

target="${1:-backups/$(date -u +%Y%m%dT%H%M%SZ)}"
mkdir -p "$target"

def backup_volume() {
  local volume="$1"
  local dest="$2"
  mkdir -p "$dest"
  docker run --rm -v "$volume:/source" -v "$dest:/dest" alpine:3.18 sh -c 'cp -a /source/. /dest/'
}

backup_volume wingcraft_paper_world "$target/world"
backup_volume wingcraft_paper_logs "$target/logs"
backup_volume wingcraft_paper_configs "$target/configs"

echo "Volumes backed up to $target"
