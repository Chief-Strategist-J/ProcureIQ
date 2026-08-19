#!/usr/bin/env bash
# OUTBOX-PATTERN-001 — state mutations emitting events must use the transactional outbox pattern. Exit 0 = pass.
# Reference §13: Direct broker publishes inside DB write paths cause dual-write inconsistency on rollback/crash.
set -euo pipefail
fail=0

# Detect direct producer.publish() / kafkaProducer.send() calls inside repository / database adapter files
direct_pub=$(grep -RnE '(\bproducer\.(publish|send|emit)\(|\bkafka\.(Produce|Send)\(|\bchannel\.(publish|basicPublish)\()' \
  --include='*.go' --include='*.kt' --include='*.ts' \
  --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null \
  | grep -iE '(repository|adapters/postgres|adapters/sql|adapters/exposed|data-layer)' \
  | grep -vE '(outbox|event_log|eventlog|_test\.|test\.)' || true)

if [ -n "$direct_pub" ]; then
  echo "VIOLATION OUTBOX-PATTERN-001: direct message broker publish inside database repository/adapter:"
  echo "$direct_pub"
  echo "  → See §13: Use the transactional outbox pattern to guarantee state-event consistency atomically."
  fail=1
fi

[ "$fail" -eq 0 ] && echo "PASS OUTBOX-PATTERN-001"
exit $fail
