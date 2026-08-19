#!/usr/bin/env bash
# CONFIG-SCHEMA-001 — requires python3 + jsonschema + pyyaml.
set -euo pipefail
CONFIG_DIR="platform/config"
SCHEMA_DIR="platform/config/schema"
if [ ! -d "$CONFIG_DIR" ] || [ ! -d "$SCHEMA_DIR" ]; then
  echo "SKIP CONFIG-SCHEMA-001: no platform/config or schema dir found yet"
  exit 2
fi
python3 - "$CONFIG_DIR" "$SCHEMA_DIR" << 'PYEOF'
import sys, glob, json, yaml
try:
    import jsonschema
except ImportError:
    print("SKIP CONFIG-SCHEMA-001: pip install jsonschema --break-system-packages")
    sys.exit(2)

cfg_dir, schema_dir = sys.argv[1], sys.argv[2]
schemas = {f.split("/")[-1].replace(".schema.json",""): json.load(open(f)) for f in glob.glob(f"{schema_dir}/*.schema.json")}
failed = False
for f in glob.glob(f"{cfg_dir}/**/*.yaml", recursive=True):
    if "/schema/" in f:
        continue
    data = yaml.safe_load(open(f))
    matched = False
    for name, schema in schemas.items():
        try:
            jsonschema.validate(data, schema)
            matched = True
            break
        except jsonschema.ValidationError:
            continue
    if not matched and schemas:
        print(f"VIOLATION CONFIG-SCHEMA-001: {f} does not validate against any schema in {schema_dir}")
        failed = True
print("PASS CONFIG-SCHEMA-001" if not failed else "")
sys.exit(1 if failed else 0)
PYEOF
