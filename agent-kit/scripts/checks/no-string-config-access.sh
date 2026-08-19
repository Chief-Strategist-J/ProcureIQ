#!/usr/bin/env bash
# CONFIG-ACCESS-001 — no string-indexed config access in features/. Exit 0 = pass.
# Config must be accessed via typed struct/class/interface, never config["key"] or config.get("key").
set -euo pipefail
fail=0

# TypeScript: config["key"] or config['key'] or process.env["KEY"] or process.env.KEY in features
ts_hits=$(grep -RnE '(config|conf|settings|env)\[["'\''](.*?)["'\'']]|process\.env\.' \
  --include='*.ts' --include='*.tsx' \
  --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null \
  | grep -E '(features/|\(features\)/)' \
  | grep -vE '(lib/config|platform/config|config/index|_test\.|test\.|spec\.)' || true)
if [ -n "$ts_hits" ]; then
  echo "VIOLATION CONFIG-ACCESS-001 [TypeScript]: string-indexed config access in feature code:"
  echo "$ts_hits"
  echo "  → Use typed config from lib/config/index.ts instead"
  fail=1
fi

# Go: os.Getenv("KEY") or viper.GetString("key") in features
go_hits=$(grep -RnE '(os\.Getenv|viper\.(Get|GetString|GetInt|GetBool))\(' \
  --include='*.go' . 2>/dev/null \
  | grep -E 'features/' \
  | grep -vE '(platform/config|_test\.go)' || true)
if [ -n "$go_hits" ]; then
  echo "VIOLATION CONFIG-ACCESS-001 [Go]: direct env/config access in feature code:"
  echo "$go_hits"
  echo "  → Inject typed config struct via dependency injection"
  fail=1
fi

# Kotlin: System.getenv("KEY") or config.getString("key") in features
kt_hits=$(grep -RnE '(System\.getenv|config\.(getString|getInt|getBoolean|property))\(' \
  --include='*.kt' . 2>/dev/null \
  | grep -E 'features/' \
  | grep -vE '(platform/config|test/|Test\.kt)' || true)
if [ -n "$kt_hits" ]; then
  echo "VIOLATION CONFIG-ACCESS-001 [Kotlin]: direct config/env access in feature code:"
  echo "$kt_hits"
  echo "  → Inject typed config data class via DI"
  fail=1
fi

[ "$fail" -eq 0 ] && echo "PASS CONFIG-ACCESS-001"
exit $fail
