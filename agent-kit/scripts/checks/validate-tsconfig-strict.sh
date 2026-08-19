#!/usr/bin/env bash
# TS-STRICT-001 — tsconfig.json must have strict:true, noUncheckedIndexedAccess:true,
# exactOptionalPropertyTypes:true. Exit 0 = pass.
set -euo pipefail
fail=0
found=0

while IFS= read -r -d '' tsconfig; do
  found=1
  # Check for required flags
  for flag in '"strict"' '"noUncheckedIndexedAccess"' '"exactOptionalPropertyTypes"'; do
    if ! grep -q "$flag" "$tsconfig" 2>/dev/null; then
      echo "VIOLATION TS-STRICT-001 [$tsconfig]: missing $flag: true"
      fail=1
      continue
    fi
    # Check that the flag is set to true (not false)
    flag_name=$(echo "$flag" | tr -d '"')
    if grep -E "\"$flag_name\"\s*:\s*false" "$tsconfig" >/dev/null 2>&1; then
      echo "VIOLATION TS-STRICT-001 [$tsconfig]: $flag is set to false — must be true"
      fail=1
    fi
  done
done < <(find . -name 'tsconfig.json' -not -path '*/node_modules/*' -not -path '*/.git/*' -print0 2>/dev/null)

if [ "$found" -eq 0 ]; then
  echo "SKIP TS-STRICT-001: no tsconfig.json found"
  exit 2
fi

[ "$fail" -eq 0 ] && echo "PASS TS-STRICT-001"
exit $fail
