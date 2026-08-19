#!/usr/bin/env bash
# API-IDEMPOTENCY-001 — requires python3 + pyyaml. Exit 0 = pass.
set -euo pipefail
SPEC="${1:-platform/contracts/openapi/openapi.yaml}"
if [ ! -f "$SPEC" ]; then
  echo "SKIP API-IDEMPOTENCY-001: no openapi spec found at $SPEC"
  exit 2
fi
python3 - "$SPEC" << 'PYEOF'
import sys, yaml
spec = yaml.safe_load(open(sys.argv[1]))
mutating = {"post", "put", "patch", "delete"}
missing = []
for path, ops in (spec.get("paths") or {}).items():
    for method, op in ops.items():
        if method.lower() not in mutating or not isinstance(op, dict):
            continue
        params = op.get("parameters", []) or []
        has_key = any(p.get("name", "").lower() == "idempotency-key" for p in params if isinstance(p, dict))
        if not has_key:
            missing.append(f"{method.upper()} {path}")
if missing:
    print("VIOLATION API-IDEMPOTENCY-001: mutating operations missing Idempotency-Key header:")
    for m in missing:
        print(" -", m)
    sys.exit(1)
print("PASS API-IDEMPOTENCY-001")
PYEOF
