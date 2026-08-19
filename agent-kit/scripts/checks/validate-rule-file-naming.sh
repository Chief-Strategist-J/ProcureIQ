#!/usr/bin/env bash
# NAMING-002 — rule YAML files must follow <feature>.<concern>.rules.yaml pattern. Exit 0 = pass.
set -euo pipefail
fail=0
found=0

while IFS= read -r -d '' f; do
  found=1
  basename=$(basename "$f")
  # Must match: <word>.<word>.rules.yaml or <word>.<word>.rules.yml
  if ! echo "$basename" | grep -qE '^[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*\.rules\.(yaml|yml)$'; then
    echo "VIOLATION NAMING-002 [$f]: rule file does not follow <feature>.<concern>.rules.yaml pattern"
    echo "  → Expected: <feature>.<concern>.rules.yaml (e.g. wallet.validation.rules.yaml)"
    fail=1
  fi
done < <(find . -path '*/rules/*' \( -name '*.rules.yaml' -o -name '*.rules.yml' -o -name '*rules*.yaml' -o -name '*rules*.yml' \) \
  -not -path '*/node_modules/*' -not -path '*/.git/*' -not -name 'rules-manifest.yaml' -print0 2>/dev/null)

if [ "$found" -eq 0 ]; then
  echo "SKIP NAMING-002: no rule YAML files found yet"
  exit 2
fi

[ "$fail" -eq 0 ] && echo "PASS NAMING-002"
exit $fail
