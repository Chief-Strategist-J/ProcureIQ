#!/usr/bin/env bash
# DB-IDEMPOTENCY-001 — idempotency tables must enforce UNIQUE(tenant_id, idempotency_key) and payload_hash. Exit 0 = pass.
# Reference §13: Database-level uniqueness is the only concurrency-safe guarantee against duplicate writes.
set -euo pipefail
fail=0
found=0

while IFS= read -r -d '' f; do
  # Look for tables named *idempotency* or *processed_events*
  if grep -qiE 'CREATE\s+TABLE\s+.*(idempotency|idempotent_requests|processed_events)' "$f" 2>/dev/null; then
    found=1
    # Check for UNIQUE constraint on tenant_id + idempotency_key (or event_id)
    if ! grep -qiE 'UNIQUE\s*\(\s*tenant_id\s*,\s*(idempotency_key|event_id|key)\s*\)' "$f" 2>/dev/null && \
       ! grep -qiE 'CREATE\s+UNIQUE\s+INDEX\s+.*ON\s+.*(tenant_id,\s*(idempotency_key|event_id|key))' "$f" 2>/dev/null; then
      echo "VIOLATION DB-IDEMPOTENCY-001 in $f: idempotency table missing composite UNIQUE(tenant_id, idempotency_key) constraint:"
      echo "  → See §13: Application memory checks race under load; DB unique constraint is mandatory."
      fail=1
    fi
    # Check for payload_hash column
    if grep -qiE 'idempotency' "$f" 2>/dev/null && ! grep -qiE 'payload_hash' "$f" 2>/dev/null; then
      echo "VIOLATION DB-IDEMPOTENCY-001 in $f: idempotency table missing 'payload_hash' column for payload mismatch validation."
      fail=1
    fi
  fi
done < <(find . -path '*/migrations/*' \( -name '*.sql' -o -name '*.up.sql' \) -print0 2>/dev/null)

if [ "$found" -eq 0 ]; then
  echo "SKIP DB-IDEMPOTENCY-001: no dedicated idempotency tables found yet"
  exit 2
fi

[ "$fail" -eq 0 ] && echo "PASS DB-IDEMPOTENCY-001"
exit $fail
