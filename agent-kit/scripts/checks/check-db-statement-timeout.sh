#!/usr/bin/env bash
# DB-STATEMENT-TIMEOUT-001 — database connections and queries must configure statement timeouts. Exit 0 = pass.
# Reference §12: A query with no timeout is a resource leak waiting for an incident.
set -euo pipefail
fail=0

# Go: sql.Open / pgxpool without timeout options in platform/adapters
go_hits=$(grep -RnE 'pgxpool\.New|sql\.Open' --include='*.go' . 2>/dev/null \
  | grep -vE '(_test\.go)' || true)
while IFS= read -r line; do
  [ -z "$line" ] && continue
  file=$(echo "$line" | cut -d: -f1)
  if ! grep -qiE '(statement_timeout|timeout|deadline|SetConnMaxLifetime)' "$file" 2>/dev/null; then
    echo "VIOLATION DB-STATEMENT-TIMEOUT-001 [Go in $file]: DB connection setup lacks statement_timeout configuration."
    fail=1
  fi
done <<< "$go_hits"

# TypeScript: pg/prisma/drizzle/knex pool setup without statement_timeout
ts_hits=$(grep -RnE 'new (Pool|Client)\(|createPool\(' --include='*.ts' --exclude-dir=node_modules . 2>/dev/null || true)
while IFS= read -r line; do
  [ -z "$line" ] && continue
  file=$(echo "$line" | cut -d: -f1)
  if ! grep -qiE '(statement_timeout|query_timeout|connectionTimeoutMillis)' "$file" 2>/dev/null; then
    echo "VIOLATION DB-STATEMENT-TIMEOUT-001 [TypeScript in $file]: DB connection setup lacks statement_timeout configuration."
    fail=1
  fi
done <<< "$ts_hits"

[ "$fail" -eq 0 ] && echo "PASS DB-STATEMENT-TIMEOUT-001"
exit $fail
