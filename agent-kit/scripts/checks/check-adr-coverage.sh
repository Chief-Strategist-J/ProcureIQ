#!/usr/bin/env bash
# ADR-COVERAGE-001 — structural changes must reference an ADR.
# In CI: pass the PR body file as $1.
# Locally: checks git commit messages for ADR references.
set -euo pipefail

PR_BODY_FILE="${1:-}"
STRUCTURAL_PATTERN='platform/|/ports/|/adapters/|/engine/|/domain/'

# Determine changed files — try multiple git diff strategies
if git rev-parse --verify origin/main >/dev/null 2>&1; then
  CHANGED_FILES="${CHANGED_FILES:-$(git diff --name-only origin/main... 2>/dev/null || true)}"
elif git rev-parse --verify main >/dev/null 2>&1; then
  CHANGED_FILES="${CHANGED_FILES:-$(git diff --name-only main... 2>/dev/null || true)}"
elif git rev-parse --verify HEAD~1 >/dev/null 2>&1; then
  CHANGED_FILES="${CHANGED_FILES:-$(git diff --name-only HEAD~1 2>/dev/null || true)}"
else
  CHANGED_FILES="${CHANGED_FILES:-$(git diff --cached --name-only 2>/dev/null || true)}"
fi

touches_structural=$(echo "$CHANGED_FILES" | grep -E "$STRUCTURAL_PATTERN" || true)
if [ -z "$touches_structural" ]; then
  echo "PASS ADR-COVERAGE-001 (no structural paths touched)"
  exit 0
fi

# Check PR body file (CI mode)
if [ -n "$PR_BODY_FILE" ] && [ -f "$PR_BODY_FILE" ]; then
  if grep -qiE 'ADR[- ]?[0-9]+|adr:' "$PR_BODY_FILE" 2>/dev/null; then
    echo "PASS ADR-COVERAGE-001 (ADR reference found in PR body)"
    exit 0
  fi
fi

# Check recent commit messages for ADR reference (local mode)
recent_commits=$(git log --oneline -5 --format='%s %b' 2>/dev/null || true)
if echo "$recent_commits" | grep -qiE 'ADR[- ]?[0-9]+|adr:'; then
  echo "PASS ADR-COVERAGE-001 (ADR reference found in recent commit messages)"
  exit 0
fi

echo "VIOLATION ADR-COVERAGE-001: structural change with no linked ADR in the PR description or commit message:"
echo "$touches_structural"
echo ""
echo "Add an ADR reference (e.g. 'ADR-0001' or 'ADR: see platform/adr/0001-...') to your commit message or PR description."
exit 1
