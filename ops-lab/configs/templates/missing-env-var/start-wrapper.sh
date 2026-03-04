#!/usr/bin/env bash
set -euo pipefail
: "Wrapper expects WORLD_NAME and JAVA_HOME"
if [[ -z "${WORLD_NAME:-}" ]]; then
  echo 'Wrapper failed: required environment variable WORLD_NAME is not set'
  exit 1
fi
if [[ -z "${JAVA_HOME:-}" ]]; then
  echo 'Wrapper failed: required environment variable JAVA_HOME is not set'
  exit 1
fi
"${JAVA_HOME}"/bin/java -jar "${WORLD_NAME}"/paperclip.jar
