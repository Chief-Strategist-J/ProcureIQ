#!/usr/bin/env bash
# UI-TRANSFORM-001 — bans in-component data transformations in .tsx. Exit 0 = pass.
set -euo pipefail
fail=0

hits=$(perl -ne '
  if (/\.(map|filter|reduce|flatMap|reduceRight|groupBy)\s*\(/) {
    unless (/\/\/ justified:/ || /\.test\./ || /\.stories\./) {
      print "$ARGV:$.: $_";
    }
  }
' $(find . -name '*.tsx' -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/__tests__/*' -not -name '*.test.*' -not -name '*.stories.*' 2>/dev/null) 2>/dev/null || true)

if [ -n "$hits" ]; then
  echo "VIOLATION UI-TRANSFORM-001: in-component data transform (.map/.filter/.reduce) found inside React component:"
  echo "$hits"
  echo "  → See §11: Raw to view-model transformation MUST live in lib/transforms/<feature>.viewmodel.ts"
  fail=1
fi

[ "$fail" -eq 0 ] && echo "PASS UI-TRANSFORM-001"
exit $fail
