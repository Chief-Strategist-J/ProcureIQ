#!/usr/bin/env bash
# CENTRAL-001 — enforces §9 Centralization Master List. Exit 0 = pass.
set -euo pipefail
fail=0

db_in_feat=$(grep -RnE '(sql\.Open|pgxpool\.New|pgx\.Connect|new\s+Pool\(|createPool\(|Database\.connect\()' \
  --include='*.go' --include='*.kt' --include='*.ts' \
  --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null \
  | grep -E '(features/|\(features\)/)' \
  | grep -vE '(_test\.|test\.)' || true)
if [ -n "$db_in_feat" ]; then
  echo "VIOLATION CENTRAL-001: database connection/pool constructed directly inside feature:"
  echo "$db_in_feat"
  fail=1
fi

http_in_feat=$(grep -RnE '(axios\.create|new\s+HttpClient\(|OkHttpClient\.Builder\(|http\.Client\{|&http\.Client\{)' \
  --include='*.go' --include='*.kt' --include='*.ts' \
  --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null \
  | grep -E '(features/|\(features\)/)' \
  | grep -vE '(_test\.|test\.)' || true)
if [ -n "$http_in_feat" ]; then
  echo "VIOLATION CENTRAL-001: HTTP client constructed directly inside feature:"
  echo "$http_in_feat"
  fail=1
fi

tracing_in_feat=$(grep -RnE '(opentelemetry\.NewTracerProvider|sdk\.start\(|new\s+NodeSDK\(|initTracer\()' \
  --include='*.go' --include='*.kt' --include='*.ts' \
  --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null \
  | grep -E '(features/|\(features\)/)' \
  | grep -vE '(_test\.|test\.)' || true)
if [ -n "$tracing_in_feat" ]; then
  echo "VIOLATION CENTRAL-001: tracing initialization found inside feature:"
  echo "$tracing_in_feat"
  fail=1
fi

[ "$fail" -eq 0 ] && echo "PASS CENTRAL-001"
exit $fail
