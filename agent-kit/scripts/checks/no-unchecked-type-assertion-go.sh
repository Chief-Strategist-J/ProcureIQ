#!/usr/bin/env bash
# GO-ASSERT-001 — every x.(T) must use the ", ok" form. Exit 0 = pass.
set -euo pipefail
hits=$(perl -ne '
  if (/\.\(([^)]+)\)/) {
    my $type = $1;
    unless ($type eq "type" || /,\s*(ok|exists|found|valid)\s*:?=/ || /_test\.go/) {
      print "$ARGV:$.: $_";
    }
  }
' $(find . -name '*.go' -not -name '*_test.go' 2>/dev/null) 2>/dev/null || true)

if [ -n "$hits" ]; then
  echo "VIOLATION GO-ASSERT-001: possible unchecked type assertion (verify manually, heuristic only):"
  echo "$hits"
  exit 1
fi
echo "PASS GO-ASSERT-001"
