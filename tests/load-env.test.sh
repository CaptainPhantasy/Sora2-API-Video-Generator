#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
source "$ROOT_DIR/scripts/load-env.sh"

tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT
marker="$tmp_dir/executed"
env_file="$tmp_dir/test.env"

printf '%s\n' \
  '# comment' \
  'OPENAI_API_KEY="test key"' \
  'PORT=4321' \
  "UNTRUSTED=\$(touch $marker)" > "$env_file"

load_env_file "$env_file"

[[ "$OPENAI_API_KEY" == 'test key' ]]
[[ "$PORT" == '4321' ]]
[[ "$UNTRUSTED" == "\$(touch $marker)" ]]
[[ ! -e "$marker" ]]

printf '%s\n' 'export BAD=value' > "$env_file"
if load_env_file "$env_file" 2>/dev/null; then
  printf 'invalid assignment was accepted\n' >&2
  exit 1
fi

printf 'safe environment parsing passed\n'
