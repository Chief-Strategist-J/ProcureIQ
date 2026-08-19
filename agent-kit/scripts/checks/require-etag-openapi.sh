#!/usr/bin/env bash
# API-CONCURRENCY-001 — required-with-justification, not blocking.
set -euo pipefail
SPEC="${1:-platform/contracts/openapi/openapi.yaml}"
if [ ! -f "$SPEC" ]; then
  echo "SKIP API-CONCURRENCY-001: no openapi spec found at $SPEC"
  exit 2
fi
python3 - "$SPEC" << 'PYEOF'
import sys, yaml
spec = yaml.safe_load(open(sys.argv[1]))
missing = []
for path, ops in (spec.get("paths") or {}).items():
    for method, op in ops.items():
        if method.lower() not in {"put", "patch"} or not isinstance(op, dict):
            continue
        params = op.get("parameters", []) or []
        has_etag = any(p.get("name", "").lower() == "if-match" for p in params if isinstance(p, dict))
        if not has_etag:
            missing.append(f"{method.upper()} {path}")
if missing:
    print("FINDING API-CONCURRENCY-001: update operations missing If-Match (required-with-justification):")
    for m in missing:
        print(" -", m)
    sys.exit(1)
print("PASS API-CONCURRENCY-001")
PYEOF
