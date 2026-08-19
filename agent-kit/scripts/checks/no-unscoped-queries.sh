#!/usr/bin/env bash
# DB-TENANT-001 — every repository/query function must take a tenant/scope parameter.
# Heuristic grep across Go, Kotlin, TypeScript. Exit 0 = pass.
set -euo pipefail
fail=0

# --- Go: repository method receivers must have tenant/tenantID/scope param (ctx alone is NOT enough) ---
GO_FUNC='func \([A-Za-z]+ \*?[A-Za-z]+Repository\) [A-Z][A-Za-z]*\('
go_hits=$(grep -RnE "$GO_FUNC" --include='*.go' . 2>/dev/null \
  | grep -vE '_test\.go' \
  | grep -viE 'tenant|tenantID|scope|orgID|organizationID' || true)
if [ -n "$go_hits" ]; then
  echo "VIOLATION DB-TENANT-001 [Go]: repository method missing tenant/scope parameter (ctx context.Context alone is NOT sufficient):"
  echo "$go_hits"
  fail=1
fi

# --- Kotlin: repository/port functions must reference tenant/scope ---
KT_FUNC='(fun|suspend fun) (find|get|list|create|update|delete|save|remove|insert|upsert|query|fetch|count|exists)'
kt_hits=$(grep -RnE "$KT_FUNC" --include='*.kt' . 2>/dev/null \
  | grep -iE 'Repository|Port|Store|Dao' \
  | grep -vE '(test/|Test\.kt:)' \
  | grep -viE 'tenant|tenantId|scope|orgId|organizationId' || true)
if [ -n "$kt_hits" ]; then
  echo "VIOLATION DB-TENANT-001 [Kotlin]: repository/port function missing tenant/scope parameter:"
  echo "$kt_hits"
  fail=1
fi

# --- TypeScript: data access functions must reference tenant/scope ---
TS_FUNC='(async\s+)?(function|const)\s+(find|get|list|create|update|delete|save|remove|fetch|query)'
ts_hits=$(grep -RnE "$TS_FUNC" --include='*.ts' --include='*.tsx' \
  --exclude-dir=node_modules . 2>/dev/null \
  | grep -iE '(repository|adapter|data/|store|dao|port)' \
  | grep -vE '(\.test\.|__tests__|_test\.)' \
  | grep -viE 'tenant|tenantId|scope|orgId|organizationId' || true)
if [ -n "$ts_hits" ]; then
  echo "VIOLATION DB-TENANT-001 [TypeScript]: data access function missing tenant/scope parameter:"
  echo "$ts_hits"
  fail=1
fi

[ "$fail" -eq 0 ] && echo "PASS DB-TENANT-001"
exit $fail
