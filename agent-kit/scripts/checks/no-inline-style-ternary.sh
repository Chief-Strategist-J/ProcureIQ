#!/usr/bin/env bash
# UI-INLINE-STYLE-001 — no inline style={{}} with ternary/conditional logic. Exit 0 = pass.
# Styling logic belongs in a style-resolver (lib/styles/), not inline in components.
set -euo pipefail

hits=$(grep -RnE 'style=\{\{[^}]*(\?|&&)' --include='*.tsx' \
  --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null || true)

if [ -n "$hits" ]; then
  echo "VIOLATION UI-INLINE-STYLE-001: conditional logic inside inline style={{}} — use a style-resolver:"
  echo "$hits"
  echo "  → Move to lib/styles/<feature>.styles.ts or use cva() for variants"
  exit 1
fi
echo "PASS UI-INLINE-STYLE-001"
