#!/usr/bin/env bash

set -euo pipefail

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
port=${PORT:-8000}

exec python3 -m http.server "$port" --directory "$script_dir"
