#!/usr/bin/env bash
# UI-LOGIC-001 — flags JSX with multi-condition inline expressions.
# Heuristic: checks for multiple && or nested ternaries in .tsx files.
# Multiline-aware via perl. Exit 0 = pass.
set -euo pipefail

hits=""

# Approach: find .tsx files in component/feature dirs, use perl to detect
# multiline patterns with 2+ && operators or nested ternaries inside JSX blocks
while IFS= read -r -d '' f; do
  # Count lines with && in JSX-like context (inside return/render blocks)
  multi_and=$(perl -0777 -ne 'while (/\{[^}]*&&[^}]*&&/gs) { print "$ARGV:$.: multi-and\n"; }' "$f" 2>/dev/null || true)
  # Nested ternary: ? ... : ... ? ... :
  nested_tern=$(perl -0777 -ne 'while (/\{[^}]*\?[^}]*\?[^}]*:[^}]*:/gs) { print "$ARGV:$.: nested-ternary\n"; }' "$f" 2>/dev/null || true)
  # Also catch single-line compound business logic: data.x > threshold && data.y !== status && ...
  compound=$(grep -nE '\{.*\b(\w+\.\w+)\s*(>|<|===|!==|>=|<=).*&&.*&&' "$f" 2>/dev/null || true)
  
  if [ -n "$multi_and" ] || [ -n "$nested_tern" ] || [ -n "$compound" ]; then
    hits+="${multi_and}${nested_tern}${compound}
"
  fi
done < <(find . -name '*.tsx' -not -path '*/node_modules/*' -not -path '*/.git/*' -print0 2>/dev/null)

hits=$(echo "$hits" | sed '/^$/d')
if [ -n "$hits" ]; then
  echo "VIOLATION UI-LOGIC-001: multi-condition logic found inline in JSX — move to lib/rules or a viewmodel:"
  echo "$hits"
  exit 1
fi
echo "PASS UI-LOGIC-001"
