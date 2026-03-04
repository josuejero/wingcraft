#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

template="${1:?./scripts/seed-config.sh <template>}"
template_dir="configs/templates/$template"

if [[ ! -d "$template_dir" ]]; then
  echo "Template $template not found in configs/templates"
  exit 1
fi

docker run --rm -v wingcraft_paper_configs:/dest -v "$template_dir":/template alpine:3.18 \
  sh -c 'cp -a /template/. /dest/'

echo "Seeded configurations for $template"
