#!/usr/bin/env bash
# DEP-PIN-001 — no floating (^ or ~) version ranges; lockfile must exist. Exit 0 = pass.
set -euo pipefail
fail=0

# Check ALL package.json files (monorepo-aware)
while IFS= read -r -d '' pj; do
  hits=$(grep -E '"\^|"~' "$pj" 2>/dev/null || true)
  if [ -n "$hits" ]; then
    echo "VIOLATION DEP-PIN-001: floating version range in $pj:"
    echo "$hits"
    fail=1
  fi
done < <(find . -name 'package.json' -not -path '*/node_modules/*' -not -path '*/.git/*' -print0 2>/dev/null)

# Check that at least one lockfile exists if any package.json is present
if find . -name 'package.json' -not -path '*/node_modules/*' -not -path '*/.git/*' -print -quit 2>/dev/null | grep -q '.'; then
  if [ ! -f package-lock.json ] && [ ! -f pnpm-lock.yaml ] && [ ! -f yarn.lock ] && [ ! -f bun.lockb ]; then
    echo "VIOLATION DEP-PIN-001: no lockfile found (package-lock.json, pnpm-lock.yaml, yarn.lock, or bun.lockb)"
    fail=1
  fi
fi

# Check Go lockfile
if [ -f go.mod ] && [ ! -f go.sum ]; then
  echo "VIOLATION DEP-PIN-001: go.sum missing"
  fail=1
fi

# Check Kotlin/Gradle lockfile
if find . -name 'build.gradle.kts' -o -name 'build.gradle' -print -quit 2>/dev/null | grep -q '.'; then
  if [ ! -f gradle.lockfile ] && ! find . -name 'gradle.lockfile' -print -quit 2>/dev/null | grep -q '.'; then
    echo "ADVISORY DEP-PIN-001: no gradle.lockfile found (consider enabling dependency locking)"
    # Not failing — Gradle lockfiles are not universally adopted
  fi
fi

[ "$fail" -eq 0 ] && echo "PASS DEP-PIN-001"
exit $fail
