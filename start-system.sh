#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
cd "$ROOT_DIR"

source "$ROOT_DIR/scripts/load-env.sh"
load_env_file "$ROOT_DIR/.env.local"

: "${OPENAI_API_KEY:?OPENAI_API_KEY must be set in .env.local}"
PORT=${PORT:-3000}
FRONTEND_PORT=${FRONTEND_PORT:-3001}

for command in node npm curl lsof; do
  command -v "$command" >/dev/null || {
    printf 'Required command is missing: %s\n' "$command" >&2
    exit 1
  }
done

for port in "$PORT" "$FRONTEND_PORT"; do
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN -t >/dev/null; then
    printf 'Port %s is already in use; stop the owning process or choose another port.\n' "$port" >&2
    exit 1
  fi
done

if [[ ! -f frontend/package-lock.json ]]; then
  printf 'frontend/package-lock.json is required for deterministic startup.\n' >&2
  exit 1
fi

if [[ ! -d frontend/node_modules ]]; then
  npm --prefix frontend ci
fi

backend_pid=''
frontend_pid=''
cleanup() {
  [[ -z "$frontend_pid" ]] || kill "$frontend_pid" 2>/dev/null || true
  [[ -z "$backend_pid" ]] || kill "$backend_pid" 2>/dev/null || true
  wait "$frontend_pid" "$backend_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

HOST=127.0.0.1 PORT="$PORT" node server.js &
backend_pid=$!
npm --prefix frontend run dev -- --hostname 127.0.0.1 --port "$FRONTEND_PORT" &
frontend_pid=$!

wait_for_url() {
  local url=$1
  for _ in {1..60}; do
    curl --fail --silent --show-error "$url" >/dev/null && return 0
    sleep 0.5
  done
  return 1
}

wait_for_url "http://127.0.0.1:$PORT/health" || {
  printf 'Backend failed to become healthy.\n' >&2
  exit 1
}
wait_for_url "http://127.0.0.1:$FRONTEND_PORT" || {
  printf 'Frontend failed to become healthy.\n' >&2
  exit 1
}

printf 'Sora video generator is running at http://127.0.0.1:%s\n' "$FRONTEND_PORT"
wait "$backend_pid" "$frontend_pid"
