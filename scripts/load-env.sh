#!/usr/bin/env bash

load_env_file() {
  local env_file=${1:-./.env.local}
  local raw line key value

  [[ -f "$env_file" ]] || {
    printf 'Environment file not found: %s\n' "$env_file" >&2
    return 1
  }

  while IFS= read -r raw || [[ -n "$raw" ]]; do
    raw=${raw%$'\r'}
    line=${raw#"${raw%%[![:space:]]*}"}
    line=${line%"${line##*[![:space:]]}"}
    [[ -z "$line" || ${line:0:1} == '#' ]] && continue

    if [[ ! "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      printf 'Invalid environment assignment in %s: %s\n' "$env_file" "$raw" >&2
      return 1
    fi

    key=${BASH_REMATCH[1]}
    value=${BASH_REMATCH[2]}
    value=${value#"${value%%[![:space:]]*}"}
    value=${value%"${value##*[![:space:]]}"}

    if [[ ${#value} -ge 2 ]]; then
      if [[ ${value:0:1} == '"' && ${value: -1} == '"' ]] ||
        [[ ${value:0:1} == "'" && ${value: -1} == "'" ]]; then
        value=${value:1:${#value}-2}
      fi
    fi

    export "$key=$value"
  done < "$env_file"
}
