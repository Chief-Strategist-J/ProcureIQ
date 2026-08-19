#!/usr/bin/env bash
# REPLICA-CONSISTENCY-001 — read consistency must be explicitly declared; arbitrary sleep-before-read is banned. Exit 0 = pass.
# Reference §12: Writes go to primary; reads default to replica unless STRONG consistency is requested.
set -euo pipefail
fail=0

# Detect sleep / delay in feature code used to wait for replica replication
sleep_hits=$(grep -RnE '(\btime\.Sleep\(|\bThread\.sleep\(|\bdelay\(|\bsetTimeout\(|await\s+sleep\()' \
  --include='*.go' --include='*.kt' --include='*.ts' --include='*.tsx' \
  --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null \
  | grep -E '(features/|\(features\)/|domain/)' \
  | grep -vE '(_test\.|test\.|spec\.|retry|backoff|polling)' || true)

if [ -n "$sleep_hits" ]; then
  echo "VIOLATION REPLICA-CONSISTENCY-001: arbitrary sleep/delay found in feature code:"
  echo "$sleep_hits"
  echo "  → See §12: Handle write-then-immediate-read via ReadConsistency.STRONG routed to primary, NEVER via arbitrary sleep."
  fail=1
fi

[ "$fail" -eq 0 ] && echo "PASS REPLICA-CONSISTENCY-001"
exit $fail
