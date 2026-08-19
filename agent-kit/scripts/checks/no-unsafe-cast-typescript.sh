#!/usr/bin/env bash
# TS-ASSERT-001 — no `as T` type assertions on external/unknown data. Exit 0 = pass.
set -euo pipefail
hits=$(grep -RnE '(^|[[:space:]])as[[:space:]]+[A-Za-z_][A-Za-z0-9_<>|\&{}\[\]]*' --include='*.ts' --include='*.tsx' \
  --exclude-dir=node_modules --exclude-dir=generated . 2>/dev/null \
  | grep -vE '[[:space:]]as[[:space:]]+const\b' \
  | grep -vE '\.schema\.ts:' \
  | grep -vE 'schema\.ts:' \
  | grep -vE '// justified:' \
  | grep -vE '/generated/' || true)
if [ -n "$hits" ]; then
  echo "VIOLATION TS-ASSERT-001: found 'as <Type>' cast — use zod .parse()/.safeParse() at the boundary instead:"
  echo "$hits"
  exit 1
fi
echo "PASS TS-ASSERT-001"
