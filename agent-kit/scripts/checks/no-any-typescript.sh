#!/usr/bin/env bash
# TS-ANY-001 — no `any` outside a commented justification. Exit 0 = pass.
set -euo pipefail
# Match: `: any`, `<any>`, `as any`, `any[]`, `any)`, `, any,`, `| any`, `& any`,
# `Record<string, any>`, `Promise<any>`, `Map<x, any>`, function param `(x: any)`
hits=$(grep -RnE '\bany\b' --include='*.ts' --include='*.tsx' \
  --exclude-dir=node_modules --exclude-dir=generated --exclude-dir=.git . 2>/dev/null \
  | grep -vE '// justified:|/\* justified:' \
  | grep -vE '_test\.|_spec\.|test\.|spec\.' \
  | grep -vE '^[^:]*:\s*//' \
  | grep -vE 'company|many|Germany|any(one|where|thing|body|how|time|more|way)' || true)
if [ -n "$hits" ]; then
  echo "VIOLATION TS-ANY-001: found unjustified 'any' usage:"
  echo "$hits"
  exit 1
fi
echo "PASS TS-ANY-001"
