# Agent enforcement kit — drop into any repo, works across Claude Code / Gemini CLI / Cursor / Codex / others

This is the mechanical half of the architecture doc. The doc explains *why*. This kit is what actually stops an AI (or a human) from ignoring it — because none of this depends on an agent choosing to comply; it depends on a script exiting non-zero.

## What's in here

```
AGENTS.md                        ← the real instruction file, read natively by most tools
CLAUDE.md, GEMINI.md             ← thin pointers, @AGENTS.md-import it (for tools that still want their own name)
.cursor/rules/architecture.mdc   ← same pointer, Cursor's format
platform/rules-manifest.yaml     ← every enforced rule: id, severity, exact check command
platform/adr/                    ← architecture decision records (TEMPLATE.md to start one)
scripts/run-rules-manifest.sh    ← runs every check in the manifest, reports pass/fail/needs-justification
scripts/checks/*.sh              ← the individual, real, runnable checks (grep/AST-based, not descriptions)
.githooks/pre-commit             ← wires the manifest into `git commit`, first line of defense
docs/architecture.md             ← the full reasoning doc — read for "why", the manifest is read for "what"
```

## Setup (once, per repo)

```bash
# 1. Copy this whole kit into your repo root, merging with anything that already exists there.

# 2. Wire the git hook:
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit scripts/run-rules-manifest.sh scripts/checks/*.sh

# 3. Install python deps used by a couple of checks (openapi/config validation):
pip install pyyaml jsonschema --break-system-packages

# 4. Wire CI to run the same thing server-side (this is non-negotiable — a pre-commit
#    hook alone can be bypassed with --no-verify, CI cannot):
#    e.g. in your pipeline: `bash scripts/run-rules-manifest.sh`

# 5. Sanity check it runs:
bash scripts/run-rules-manifest.sh
```

## Wiring per tool (why each file exists)

- **Claude Code** — reads `CLAUDE.md`, which is one line: `@AGENTS.md`. All real content lives in `AGENTS.md` so it isn't duplicated and can't drift.
- **Gemini CLI** — same pattern via `GEMINI.md`.
- **Cursor** — `.cursor/rules/architecture.mdc` with `alwaysApply: true`, pointing back to `AGENTS.md`.
- **Codex, Copilot, Windsurf, Aider, Zed, JetBrains Junie, and most others** — read `AGENTS.md` natively, no extra file needed.
- If you pick up a new tool later that wants its own filename, add a one-line `@AGENTS.md`-import file for it rather than writing new instructions — the moment content is duplicated across files it will drift, and drifted rules are worse than no rules because they look authoritative.

## How this actually stops an AI from ignoring the rules

1. `AGENTS.md` tells every agent, explicitly, to read `platform/rules-manifest.yaml` and run `scripts/run-rules-manifest.sh` before claiming a change is done — this is instruction, still just prose, still not enforced on its own.
2. The **pre-commit hook** is what makes it real for local work — a commit that fails a `blocking` rule does not go through, regardless of what any agent believes about its own output.
3. **CI** re-runs the identical checks server-side, because a hook can be skipped with `--no-verify` and CI cannot. A PR cannot merge on a red check, full stop, and this is enforced by your CI provider's branch protection, not by anyone's judgment.
4. **No step in this chain trusts an agent's self-report.** An agent saying "this follows the rules" is a claim; the hook and CI are the verification. This is the actual answer to "my AI isn't following the rules" — the rules were never mechanically checked before, so nothing actually blocked a violation regardless of how clearly they were written down.

## Extending the manifest

Every rule needs: a unique `id`, a `severity` (`blocking` / `required-with-justification` / `advisory`), and — if you want it actually enforced rather than aspirational — a `check` script that exits `0` on pass, non-zero on a real violation, and `2` when the check can't run in the current environment (missing tool, no spec file yet) so it's reported as unverified rather than silently treated as a pass.

The scripts under `scripts/checks/` are intentionally simple (mostly `grep`-based heuristics) so they run anywhere with just `bash` + `python3`, no project-specific tooling required to get started. Swap them for real linters/AST tools (`errcheck`, ESLint custom rules, `staticcheck`, a real OpenAPI linter) as your stack solidifies — the manifest and the orchestrator don't change, only what `check:` points to.
