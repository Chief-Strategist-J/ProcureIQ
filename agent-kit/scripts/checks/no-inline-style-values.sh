#!/usr/bin/env bash
# UI-STYLE-001 — no raw hex/px outside a token file. required-with-justification, not blocking.
set -euo pipefail
hits=$(grep -RnE '#[0-9a-fA-F]{3,6}\b|[0-9]+px\b' --include='*.tsx' \
  --exclude-dir=node_modules --exclude='*tokens*' . 2>/dev/null || true)
if [ -n "$hits" ]; then
  echo "FINDING UI-STYLE-001: raw hex/px outside token file (required-with-justification):"
  echo "$hits"
  exit 1
fi
echo "PASS UI-STYLE-001"
