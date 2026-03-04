#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

tail -n 60 logs/latest.log
