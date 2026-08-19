#!/usr/bin/env bash
# DB-COMPAT-001 — enforces §12 Database Schema Versioning & Compatibility Window. Exit 0 = pass.
# Reference §12: Backward compatibility window is a config value (db.compat.minSupportedSchemaVersion).
set -euo pipefail
fail=0

CONFIG_FILE="platform/config/base.yaml"
if [ -f "$CONFIG_FILE" ]; then
  if ! grep -qiE 'minSupportedSchemaVersion|min_supported_schema_version|db\.compat' "$CONFIG_FILE" 2>/dev/null; then
    echo "VIOLATION DB-COMPAT-001 in $CONFIG_FILE: missing 'db.compat.minSupportedSchemaVersion' configuration."
    echo "  → See §12: Schema compatibility window must be explicitly defined in base.yaml to prevent breaking deployed services."
    fail=1
  fi
fi

# Check migration sequential versioning if migrations exist
for mig_dir in $(find . -type d -name 'migrations' 2>/dev/null | grep -vE '(node_modules|\.git)' || true); do
  non_versioned=$(find "$mig_dir" \( -name '*.sql' -o -name '*.up.sql' \) 2>/dev/null | grep -vE '/[0-9]{3,}_' || true)
  if [ -n "$non_versioned" ]; then
    echo "VIOLATION DB-COMPAT-001 in $mig_dir: migration files must start with numeric version prefix (e.g. 0001_name.sql):"
    echo "$non_versioned"
    fail=1
  fi
done

[ "$fail" -eq 0 ] && echo "PASS DB-COMPAT-001"
exit $fail
