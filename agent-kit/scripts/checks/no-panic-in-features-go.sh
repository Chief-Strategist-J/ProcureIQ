#!/usr/bin/env bash
# GO-PANIC-001 — no panic() calls in features/ or domain/ code. Exit 0 = pass.
# panic/recover belongs only in platform/middleware as a last-resort safety net.
set -euo pipefail
TARGET_DIRS='(features/|domain/)'
hits=$(grep -RnE '\bpanic\(' --include='*.go' . 2>/dev/null \
  | grep -E "$TARGET_DIRS" \
  | grep -vE '(_test\.go|platform/|middleware/)' || true)
if [ -n "$hits" ]; then
  echo "VIOLATION GO-PANIC-001: panic() found in feature/domain code — use error returns instead:"
  echo "$hits"
  exit 1
fi
echo "PASS GO-PANIC-001"
