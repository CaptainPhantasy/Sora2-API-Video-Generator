#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT_DIR"

bash -n start-system.sh scripts/load-env.sh scripts/check.sh tests/load-env.test.sh
node --test tests/*.test.js
bash tests/load-env.test.sh
npm --prefix frontend ci
npm --prefix frontend run lint
npm --prefix frontend run build
npm --prefix frontend audit --audit-level=moderate
git diff --check
