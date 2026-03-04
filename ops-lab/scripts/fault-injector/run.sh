#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

script="${1:?specify script under scripts/fault-injector, e.g. plugin-stack.sh}"

docker compose --profile fault-injector run --rm fault-injector "/work/$script"
