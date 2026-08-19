#!/usr/bin/env bash
# DB-MIGRATION-003 — migrations must be idempotent (IF NOT EXISTS guards). Exit 0 = pass.
set -euo pipefail
fail=0
found=0

while IFS= read -r -d '' f; do
  found=1

  # CREATE TABLE without IF NOT EXISTS
  create_hits=$(grep -niE 'CREATE\s+TABLE\b' "$f" 2>/dev/null | grep -viE 'IF\s+NOT\s+EXISTS' || true)
  if [ -n "$create_hits" ]; then
    echo "VIOLATION DB-MIGRATION-003 in $f: CREATE TABLE without IF NOT EXISTS:"
    echo "$create_hits"
    fail=1
  fi

  # ADD COLUMN without IF NOT EXISTS (PostgreSQL supports this)
  add_col_hits=$(grep -niE 'ADD\s+(COLUMN\s+)?[A-Za-z_]' "$f" 2>/dev/null \
    | grep -viE 'IF\s+NOT\s+EXISTS' \
    | grep -viE 'ADD\s+CONSTRAINT|ADD\s+INDEX|ADD\s+PRIMARY|ADD\s+FOREIGN|ADD\s+UNIQUE|ADD\s+CHECK' || true)
  if [ -n "$add_col_hits" ]; then
    echo "VIOLATION DB-MIGRATION-003 in $f: ADD COLUMN without IF NOT EXISTS:"
    echo "$add_col_hits"
    fail=1
  fi

  # CREATE INDEX without IF NOT EXISTS
  idx_hits=$(grep -niE 'CREATE\s+(UNIQUE\s+)?INDEX\b' "$f" 2>/dev/null | grep -viE 'IF\s+NOT\s+EXISTS' || true)
  if [ -n "$idx_hits" ]; then
    echo "VIOLATION DB-MIGRATION-003 in $f: CREATE INDEX without IF NOT EXISTS:"
    echo "$idx_hits"
    fail=1
  fi
done < <(find . -path '*/migrations/*' \( -name '*.sql' -o -name '*.up.sql' \) -print0 2>/dev/null)

if [ "$found" -eq 0 ]; then
  echo "SKIP DB-MIGRATION-003: no migration files found"
  exit 2
fi

[ "$fail" -eq 0 ] && echo "PASS DB-MIGRATION-003"
exit $fail
