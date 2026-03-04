#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
./scripts/archive-reset.sh
./scripts/prepare-scenario.sh config-corruption-loop
