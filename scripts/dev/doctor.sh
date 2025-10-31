#!/usr/bin/env bash
set -uo pipefail

STATUS=0

info() {
  echo "[doctor] $1"
}

check_cmd_version() {
  local cmd="$1"
  local args=("${@:2}")
  if output=$("$cmd" "${args[@]}" 2>/dev/null); then
    info "$cmd ${args[*]} ok: $output"
  else
    info "$cmd ${args[*]} failed"
    STATUS=1
  fi
}

check_docker() {
  check_cmd_version docker --version
  check_cmd_version docker compose version
}

check_api_health() {
  local url="http://localhost:8000/healthz"
  if response=$(curl -sf "$url"); then
    info "api health ok: $response"
  else
    info "api health failed for $url"
    STATUS=1
  fi
}

check_db_table() {
  local table="verses"
  if docker compose exec -T db psql -U postgres -d holly -Atqc "SELECT 1 FROM pg_tables WHERE tablename='${table}' LIMIT 1;" | grep -q 1; then
    info "postgres table '$table' exists"
  else
    info "postgres table '$table' missing"
    STATUS=1
  fi
}

check_env_format() {
  if [[ ! -f .env ]]; then
    info ".env missing"
    STATUS=1
    return
  fi

  if awk 'BEGIN{status=0} /^[ \t]*(#|$)/{next} !/^[A-Za-z_][A-Za-z0-9_]*=.*/{status=1; print "[doctor] invalid env line " NR ": " $0} END{exit status}' .env; then
    info ".env format ok"
  else
    STATUS=1
  fi
}

main() {
  check_docker
  check_api_health
  check_db_table
  check_env_format

  if [[ $STATUS -eq 0 ]]; then
    info "all checks passed"
  else
    info "one or more checks failed"
  fi

  exit "$STATUS"
}

main "$@"
