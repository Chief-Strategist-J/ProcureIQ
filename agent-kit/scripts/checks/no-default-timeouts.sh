#!/usr/bin/env bash
# RESOURCE-TIMEOUT-001 — every outbound HTTP/DB/broker client must have an explicit timeout.
# Heuristic: checks for common client construction patterns without timeout configuration.
set -euo pipefail
fail=0

# Go: http.Client{} without Timeout, sql.Open without SetConnMaxLifetime, etc.
go_hits=$(grep -RnE '(http\.Client\{|&http\.Client\{)' --include='*.go' . 2>/dev/null \
  | grep -vE 'Timeout|_test\.go' || true)
if [ -n "$go_hits" ]; then
  echo "FINDING RESOURCE-TIMEOUT-001 [Go]: http.Client without explicit Timeout:"
  echo "$go_hits"
  fail=1
fi

# Go: net.Dial / net.DialContext without deadline
go_dial=$(grep -RnE '\bnet\.Dial\(' --include='*.go' . 2>/dev/null \
  | grep -vE 'DialContext|Timeout|Deadline|_test\.go' || true)
if [ -n "$go_dial" ]; then
  echo "FINDING RESOURCE-TIMEOUT-001 [Go]: net.Dial without DialContext/timeout:"
  echo "$go_dial"
  fail=1
fi

# TypeScript: fetch() without AbortSignal/timeout
while IFS= read -r -d '' f; do
  unprotected_fetch=$(perl -0777 -ne '
    while (/fetch\s*\([^;]*\)/gs) {
      my $call = $&;
      unless ($call =~ /(signal|AbortSignal|timeout|AbortController)/i) {
        print "$ARGV: unprotected fetch call lacking signal/timeout\n";
      }
    }
  ' "$f" 2>/dev/null || true)
  if [ -n "$unprotected_fetch" ]; then
    echo "FINDING RESOURCE-TIMEOUT-001 [TypeScript in $f]: fetch() without signal/timeout configuration:"
    echo "$unprotected_fetch"
    fail=1
  fi
done < <(find . \( -path '*/lib/data/*' -o -path '*/adapters/*' -o -path '*/http/*' \) \( -name '*.ts' -o -name '*.tsx' \) \
  -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/__tests__/*' -print0 2>/dev/null)

# Kotlin: HttpClient without timeout config
kt_hits=$(grep -RnE '(HttpClient\(|OkHttpClient\(|OkHttpClient\.Builder)' --include='*.kt' . 2>/dev/null \
  | grep -vE '(timeout|connectTimeout|readTimeout|writeTimeout|callTimeout|test/|Test\.kt)' || true)
if [ -n "$kt_hits" ]; then
  echo "FINDING RESOURCE-TIMEOUT-001 [Kotlin]: HTTP client without timeout configuration:"
  echo "$kt_hits"
  fail=1
fi

[ "$fail" -eq 0 ] && echo "PASS RESOURCE-TIMEOUT-001"
exit $fail
