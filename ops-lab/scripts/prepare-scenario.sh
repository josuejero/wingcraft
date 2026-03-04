#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

scenario="${1:-baseline}"
env_file="env/$scenario.env"

if [[ ! -f "$env_file" ]]; then
  echo "Scenario env file not found: $env_file"
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "$env_file"
set +a

template="${CONFIG_TEMPLATE:-$scenario}"
./scripts/seed-config.sh "$template"

cat <<EOF
Scenario        : ${SCENARIO_NAME:-$scenario}
Env file        : $env_file
Config template : $template
Start lab       : docker compose --env-file env/common.env --env-file "$env_file" up
EOF
