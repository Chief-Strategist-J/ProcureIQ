#!/usr/bin/env bash
# UI-CROSS-IMPORT-001 — no cross-feature imports between vertical slices. Exit 0 = pass.
# A feature must never import from another feature's directory directly.
# Shared code goes to platform/, components/ui/, lib/, or ports/event-bus.
set -euo pipefail
fail=0

# --- 1. TypeScript / Next.js Feature Cross-Imports ---
while IFS= read -r -d '' f; do
  # Extract feature name from path: app/(features)/<feature>/... or features/<feature>/...
  feature=""
  if [[ "$f" =~ (features|\(features\))/([^/]+) ]]; then
    feature="${BASH_REMATCH[2]}"
  fi

  if [ -z "$feature" ]; then
    continue
  fi

  # Check for relative sibling imports like '../sibling-feature/'
  # or alias imports like '@/features/sibling', '@/app/(features)/sibling'
  rel_sibling=$(grep -nE "(import|from|require)[[:space:]]*\(?['\"].*(\.\./|[(@~/]features/|[(@~/]\(features\)/)" "$f" 2>/dev/null \
    | grep -vE "(features/$feature|\(features\)/$feature|\.\./components|\.\./lib|\.\./ui|\.\./hooks|\.\./types)" \
    | grep -vE '(//|/\*)' || true)

  if [ -n "$rel_sibling" ]; then
    echo "VIOLATION UI-CROSS-IMPORT-001 [TypeScript $f]: cross-feature import detected in feature '$feature':"
    echo "$rel_sibling"
    echo "  → Vertical slices must be isolated. Move shared UI to components/ui/ or logic to lib/ / event bus."
    fail=1
  fi
done < <(find . \( -path '*/features/*' -o -path '*/(features)/*' \) \( -name '*.ts' -o -name '*.tsx' \) \
  -not -path '*/node_modules/*' -not -path '*/.git/*' -print0 2>/dev/null)

# --- 2. Go Feature Cross-Imports ---
while IFS= read -r -d '' f; do
  feature=""
  if [[ "$f" =~ features/([^/]+) ]]; then
    feature="${BASH_REMATCH[1]}"
  fi

  if [ -z "$feature" ]; then
    continue
  fi

  go_cross=$(grep -nE 'internal/features/' "$f" 2>/dev/null \
    | grep -vE "internal/features/$feature" \
    | grep -vE '(//|/\*)' || true)

  if [ -n "$go_cross" ]; then
    echo "VIOLATION UI-CROSS-IMPORT-001 [Go $f]: cross-feature import detected in feature '$feature':"
    echo "$go_cross"
    echo "  → Features must communicate via ports / events / engine, never direct internal imports."
    fail=1
  fi
done < <(find . -path '*/features/*' -name '*.go' -not -path '*/vendor/*' -not -path '*/.git/*' -print0 2>/dev/null)

# --- 3. Kotlin Feature Cross-Imports ---
while IFS= read -r -d '' f; do
  feature=""
  if [[ "$f" =~ features/([^/]+) ]]; then
    feature="${BASH_REMATCH[1]}"
  fi

  if [ -z "$feature" ]; then
    continue
  fi

  kt_cross=$(grep -nE '^import[[:space:]]+.*features\.' "$f" 2>/dev/null \
    | grep -vE "features\.$feature\." \
    | grep -vE '(//|/\*)' || true)

  if [ -n "$kt_cross" ]; then
    echo "VIOLATION UI-CROSS-IMPORT-001 [Kotlin $f]: cross-feature import detected in feature '$feature':"
    echo "$kt_cross"
    echo "  → Features must communicate via ports / event bus, never direct feature imports."
    fail=1
  fi
done < <(find . -path '*/features/*' -name '*.kt' -not -path '*/.git/*' -print0 2>/dev/null)

[ "$fail" -eq 0 ] && echo "PASS UI-CROSS-IMPORT-001"
exit $fail
