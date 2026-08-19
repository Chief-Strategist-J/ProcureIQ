#!/usr/bin/env bash
# GO-ERRCHECK-001 — requires the `errcheck` tool. Exit 0 = pass.
set -euo pipefail
if ! command -v errcheck >/dev/null 2>&1; then
  echo "SKIP GO-ERRCHECK-001: errcheck not installed (go install github.com/kisielk/errcheck@latest) — treat as unverified, not passed"
  exit 2
fi
if ! errcheck ./... ; then
  echo "VIOLATION GO-ERRCHECK-001: unchecked errors found above"
  exit 1
fi
echo "PASS GO-ERRCHECK-001"
