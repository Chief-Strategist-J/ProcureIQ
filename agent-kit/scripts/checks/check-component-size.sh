#!/usr/bin/env bash
# UI-COMPONENT-SIZE-001 — flag .tsx files over 100 lines. Exit 0 = pass (advisory warnings only).
# Components over 100 lines are likely doing more than rendering.
set -euo pipefail
fail=0

while IFS= read -r -d '' f; do
  lines=$(wc -l < "$f")
  if [ "$lines" -gt 100 ]; then
    echo "FINDING UI-COMPONENT-SIZE-001 [$f]: $lines lines (threshold: 100)"
    echo "  → Consider splitting into container + presentational components"
    fail=1
  fi
done < <(find . -name '*.tsx' \
  -not -path '*/node_modules/*' -not -path '*/.git/*' \
  -not -path '*/__tests__/*' -not -path '*.test.*' -not -path '*.stories.*' \
  -print0 2>/dev/null)

[ "$fail" -eq 0 ] && echo "PASS UI-COMPONENT-SIZE-001"
exit $fail
