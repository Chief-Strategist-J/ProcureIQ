#!/usr/bin/env bash
# Reads platform/rules-manifest.yaml and runs every rule's check script.
# Exit code: 0 if no `blocking` rule failed. Non-zero otherwise.
# `required-with-justification` failures print but never flip the exit code —
# they must be surfaced to a human, not silently gated.
#
# Usage:
#   scripts/run-rules-manifest.sh              # run everything
#   scripts/run-rules-manifest.sh --changed    # only checks relevant to git-changed files

set -uo pipefail

# Resolve to the directory containing this script, then up to repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

if ! python3 -c "import yaml" 2>/dev/null; then
  echo "Installing pyyaml (one-time)..."
  pip install pyyaml --break-system-packages --quiet 2>/dev/null || pip3 install pyyaml --quiet
fi

python3 - "$@" <<'PYEOF'
import subprocess, sys, yaml, os, re

changed_only = "--changed" in sys.argv

# Determine which file extensions are present in the diff
changed_langs = set()
if changed_only:
    try:
        diff_output = subprocess.run(
            ["git", "diff", "--name-only", "HEAD~1"],
            capture_output=True, text=True, cwd=os.getcwd()
        )
        if diff_output.returncode != 0:
            # Fallback: diff against staging area
            diff_output = subprocess.run(
                ["git", "diff", "--cached", "--name-only"],
                capture_output=True, text=True, cwd=os.getcwd()
            )
        changed_files = diff_output.stdout.strip().split("\n") if diff_output.stdout.strip() else []

        ext_to_lang = {
            ".kt": "kotlin", ".kts": "kotlin",
            ".go": "go",
            ".ts": "typescript", ".tsx": "typescript",
            ".sql": "sql",
            ".yaml": "any", ".yml": "any", ".json": "any",
        }
        for f in changed_files:
            ext = os.path.splitext(f)[1].lower()
            if ext in ext_to_lang:
                changed_langs.add(ext_to_lang[ext])
            else:
                changed_langs.add("any")  # unknown extensions trigger 'any' rules

        if not changed_langs:
            print("No relevant changed files found. All rules pass by default.")
            sys.exit(0)

        # Always run 'any' lang rules when anything changes
        changed_langs.add("any")
        print(f"Changed file languages detected: {', '.join(sorted(changed_langs))}")
        print()
    except Exception as e:
        print(f"WARNING: Could not determine changed files ({e}), running all checks.")
        changed_only = False

manifest_path = "platform/rules-manifest.yaml"
if not os.path.exists(manifest_path):
    print(f"ERROR: {manifest_path} not found. Are you running from the agent-kit root?")
    sys.exit(1)

with open(manifest_path) as f:
    manifest = yaml.safe_load(f)

blocking_failed = []
justification_needed = []
skipped = []
passed = []

for rule in manifest.get("rules", []):
    rid = rule["id"]
    severity = rule["severity"]
    lang = rule.get("lang", "any")
    check = rule.get("check")

    if not check:
        skipped.append(rid)
        continue

    # --changed filtering: skip rules whose language doesn't match any changed file
    if changed_only and lang not in changed_langs:
        print(f"SKIP  {rid} (no {lang} files in diff)")
        skipped.append(rid)
        continue

    if not os.path.exists(check):
        print(f"SKIP  {rid}: check script not found at {check}")
        skipped.append(rid)
        continue

    result = subprocess.run(["bash", check], capture_output=True, text=True)
    out = (result.stdout + result.stderr).strip()

    if result.returncode == 0:
        print(f"PASS  {rid}")
        passed.append(rid)
    elif result.returncode == 2:
        print(f"SKIP  {rid} (unverified — tool/spec not available in this environment)")
        if out:
            print("      " + out.replace("\n", "\n      "))
        skipped.append(rid)
    else:
        if severity == "blocking":
            print(f"FAIL  {rid}  [blocking]")
            blocking_failed.append(rid)
        elif severity == "required-with-justification":
            print(f"FLAG  {rid}  [required-with-justification — needs explicit human sign-off]")
            justification_needed.append(rid)
        else:
            print(f"WARN  {rid}  [advisory]")
        if out:
            print("      " + out.replace("\n", "\n      "))

print()
print(f"Summary: {len(passed)} passed, {len(blocking_failed)} blocking failures, "
      f"{len(justification_needed)} need justification, {len(skipped)} skipped/unverified.")

if blocking_failed:
    print()
    print("BLOCKING rules failed — this change is NOT ready:")
    for rid in blocking_failed:
        print(f"  - {rid}")
    sys.exit(1)

if justification_needed:
    print()
    print("required-with-justification findings exist — surface these explicitly, do not proceed silently:")
    for rid in justification_needed:
        print(f"  - {rid}")

sys.exit(0)
PYEOF
