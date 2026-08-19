#!/usr/bin/env bash
# SECURITY-SECRET-001 — scan for committed secrets. For production, wire in gitleaks/trufflehog.
set -euo pipefail

# Comprehensive pattern list
PATTERN='AKIA[0-9A-Z]{16}'
PATTERN+='|-----BEGIN (RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----'
PATTERN+='|xox[baprs]-[0-9A-Za-z-]{10,}'
PATTERN+='|AIza[0-9A-Za-z\-_]{35}'
PATTERN+='|ghp_[0-9A-Za-z]{36}'
PATTERN+='|gho_[0-9A-Za-z]{36}'
PATTERN+='|github_pat_[0-9A-Za-z_]{22,}'
PATTERN+='|glpat-[0-9A-Za-z\-_]{20,}'
PATTERN+='|sk-[0-9A-Za-z]{20,}'
PATTERN+='|sk_live_[0-9A-Za-z]{20,}'
PATTERN+='|rk_live_[0-9A-Za-z]{20,}'
PATTERN+='|sq0[a-z]{3}-[0-9A-Za-z\-_]{22,}'
PATTERN+='|SG\.[0-9A-Za-z\-_]{22,}\.[0-9A-Za-z\-_]{22,}'
PATTERN+='|hooks\.slack\.com/services/T[A-Z0-9]+/B[A-Z0-9]+/[0-9A-Za-z]+'
PATTERN+='|password\s*[:=]\s*"[^"]{8,}'

hits=$(grep -RnE "$PATTERN" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=vendor \
  --exclude='*.lock' --exclude='*.sum' --exclude='*.lockb' \
  --exclude='no-committed-secrets.sh' \
  . 2>/dev/null \
  | grep -vE '(EXAMPLE|PLACEHOLDER|CHANGEME|your-|xxx|000)' || true)

if [ -n "$hits" ]; then
  echo "VIOLATION SECURITY-SECRET-001: possible committed secret found:"
  echo "$hits"
  exit 1
fi
echo "PASS SECURITY-SECRET-001 (pattern scan — wire in gitleaks/trufflehog for full coverage)"
