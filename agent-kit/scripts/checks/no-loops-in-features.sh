#!/usr/bin/env bash
# LOOP-001 — no for/while/do-while loops in features/, domain/, components. Exit 0 = pass.
set -euo pipefail
TARGET_DIRS='(features/|domain/|components/|\(features\)/)'

hits=$( (grep -RnE '(^|[[:space:]])(for[[:space:]]|for\(|for[[:space:]]+await|while[[:space:]]*\(|do[[:space:]]*\{)' \
  --include='*.go' --include='*.kt' --include='*.ts' --include='*.tsx' . 2>/dev/null || true) \
  | grep -E "$TARGET_DIRS" \
  | grep -vE '(fp/|_test\.|_test_|\.test\.|Test\.kt:)' || true)
if [ -n "$hits" ]; then
  echo "VIOLATION LOOP-001: raw loop found in a feature/domain/UI file — use map/filter/fold/reduce/pipe:"
  echo "$hits"
  exit 1
fi
echo "PASS LOOP-001"
