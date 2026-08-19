#!/usr/bin/env bash
# UI-MAGIC-VALUES-001 — no inline magic threshold numbers or status strings in components. Exit 0 = pass.
set -euo pipefail
fail=0

magic_hits=""
while IFS= read -r -d '' f; do
  hit=$(perl -ne '
    if (/(===|!==|>|<|>=|<=)\s*([0-9]{2,}|[\x27"][A-Z0-9_]{3,}[\x27"])/) {
      my $line = $_;
      unless ($line =~ /\b(statusCode|200|404|500|0|1|100|px|rem|em|width|height|opacity|zIndex|flex|grid|gap|columns|rows)\b/i || $line =~ /(\/\/|\/\*)/) {
        print "$ARGV:$.: $line";
      }
    }
  ' "$f" 2>/dev/null || true)
  if [ -n "$hit" ]; then
    magic_hits+="$hit"
  fi
done < <(find . -name '*.tsx' -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/__tests__/*' -not -name '*.test.*' -not -name '*.stories.*' -print0 2>/dev/null)

if [ -n "$magic_hits" ]; then
  echo "FINDING UI-MAGIC-VALUES-001: potential hardcoded business magic value in component:"
  echo "$magic_hits"
  echo "  → See §11: Source thresholds and status literals from lib/config or contract enums."
  fail=1
fi

[ "$fail" -eq 0 ] && echo "PASS UI-MAGIC-VALUES-001"
exit $fail
