#!/usr/bin/env bash
# KT-NULL-001 — no `!!` operator outside test source sets. Exit 0 = pass.
set -euo pipefail
hits=$(grep -RnE '!!' --include='*.kt' . 2>/dev/null \
  | grep -vE '(/test/|/androidTest/|Test\.kt:|/testFixtures/)' \
  | grep -vE '^[^:]*:[^:]*:\s*//' \
  | grep -vE '"[^"]*!![^"]*"' || true)
if [ -n "$hits" ]; then
  echo "VIOLATION KT-NULL-001: found '!!' outside test sources:"
  echo "$hits"
  exit 1
fi
echo "PASS KT-NULL-001"
