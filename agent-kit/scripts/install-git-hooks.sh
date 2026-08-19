#!/usr/bin/env bash
# Installs local git pre-commit hook to mechanically block any commit violating rules.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null | head -n 1)"
HOOKS_DIR="$REPO_ROOT/.git/hooks"

if [ ! -d "$HOOKS_DIR" ]; then
  echo "Error: .git/hooks directory not found at $HOOKS_DIR"
  exit 1
fi

PRE_COMMIT="$HOOKS_DIR/pre-commit"

cat > "$PRE_COMMIT" << 'HOOKEOF'
#!/usr/bin/env bash
# Pre-commit gate: runs rules manifest on staged/changed files.
# If any blocking rule fails, git commit is REJECTED.
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
RUNNER="$REPO_ROOT/agent-kit/scripts/run-rules-manifest.sh"
if [ ! -f "$RUNNER" ] && [ -f "$REPO_ROOT/../agent-kit/scripts/run-rules-manifest.sh" ]; then
  RUNNER="$REPO_ROOT/../agent-kit/scripts/run-rules-manifest.sh"
fi

if [ -f "$RUNNER" ]; then
  echo "==> Running Mechanical Rules Manifest Pre-Commit Gate..."
  bash "$RUNNER" --changed
else
  echo "Warning: rules runner not found at $RUNNER"
fi
HOOKEOF

chmod +x "$PRE_COMMIT"
echo "✅ Git pre-commit hook successfully installed at $PRE_COMMIT"
echo "Any commit violating architectural rules will be rejected automatically."
