#!/usr/bin/env bash
# DB-RLS-001 — every table containing tenant_id must enable Row-Level Security. Exit 0 = pass.
set -euo pipefail
fail=0
found=0

while IFS= read -r -d '' f; do
  tables_with_tenant=$(perl -0777 -ne '
    while (/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["\x27]?([A-Za-z0-9_]+)["\x27]?\s*\(([^;]+)\);/gis) {
      my ($table, $body) = ($1, $2);
      if ($body =~ /\btenant_id\b/i) {
        print "$table\n";
      }
    }
  ' "$f" 2>/dev/null || true)

  for table in $tables_with_tenant; do
    [ -z "$table" ] && continue
    found=1
    has_rls=$(perl -0777 -ne "
      if (/ALTER\\s+TABLE\\s+(?:ONLY\\s+)?[\"\x27]?$table[\"\x27]?\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY/i) {
        print \"RLS_ENABLED\";
      }
    " "$f" 2>/dev/null || true)

    if [ -z "$has_rls" ]; then
      echo "VIOLATION DB-RLS-001 in $f: table '$table' has tenant_id column but lacks 'ALTER TABLE $table ENABLE ROW LEVEL SECURITY;'"
      fail=1
    fi
  done
done < <(find . -path '*/migrations/*' \( -name '*.sql' -o -name '*.up.sql' \) -print0 2>/dev/null)

if [ "$found" -eq 0 ]; then
  echo "SKIP DB-RLS-001: no migration files found yet"
  exit 2
fi

[ "$fail" -eq 0 ] && echo "PASS DB-RLS-001"
exit $fail
