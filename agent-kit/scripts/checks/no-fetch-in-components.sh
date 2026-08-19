#!/usr/bin/env bash
# UI-FETCH-001 — no fetch/axios inside .tsx components. Exit 0 = pass.
set -euo pipefail
hits=$(grep -RnE '(^|[[:space:]])(fetch\(|axios\.)' --include='*.tsx' \
  --exclude-dir=node_modules --exclude-dir=lib . 2>/dev/null || true)
if [ -n "$hits" ]; then
  echo "VIOLATION UI-FETCH-001: direct fetch/axios call inside UI component:"
  echo "$hits"
  echo "  → See §11: All fetching belongs in lib/data/<feature>.ts"
  exit 1
fi
echo "PASS UI-FETCH-001"
