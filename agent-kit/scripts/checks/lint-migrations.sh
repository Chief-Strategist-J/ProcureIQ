#!/usr/bin/env bash
# DB-MIGRATION-001 / 002 — additive-only, ADR-referenced destructive migrations. Exit 0 = pass.
set -euo pipefail
fail=0
while IFS= read -r -d '' f; do
  # DB-MIGRATION-001: each ADD COLUMN ... NOT NULL must have DEFAULT on the SAME line or next line
  # Use perl for per-statement checking instead of whole-file grep
  not_null_hits=$(perl -ne '
    if (/ADD\s+(COLUMN\s+)?\S+\s+.*NOT\s+NULL/i) {
      unless (/DEFAULT/i) {
        print "$ARGV:$.: $_";
      }
    }
  ' "$f" 2>/dev/null || true)
  if [ -n "$not_null_hits" ]; then
    echo "VIOLATION DB-MIGRATION-001 in $f: NOT NULL column added without DEFAULT on the same statement:"
    echo "$not_null_hits"
    fail=1
  fi

  # DB-MIGRATION-002: destructive ops need -- ADR: comment in the same file
  if grep -qiE 'DROP\s+(COLUMN|TABLE|INDEX)|RENAME\s+(COLUMN|TABLE)|ALTER\s+COLUMN\s+\S+\s+(SET\s+DATA\s+)?TYPE' "$f" 2>/dev/null; then
    if ! grep -qE '\-\-\s*ADR:' "$f" 2>/dev/null; then
      echo "VIOLATION DB-MIGRATION-002 in $f: destructive migration with no '-- ADR:' reference comment"
      fail=1
    fi
  fi
done < <(find . -path '*/migrations/*' \( -name '*.sql' -o -name '*.up.sql' \) -print0 2>/dev/null)
[ "$fail" -eq 0 ] && echo "PASS DB-MIGRATION-001/002"
exit $fail
