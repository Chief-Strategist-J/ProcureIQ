#!/usr/bin/env bash
# RULE-ENGINE-LEVELS-001 — bans if-else branching for business decisions in features.
# Enforces that decision logic must use the 3-level Rules Engine (Atomic, Compound, Policy)
# with full auditability, trace IDs, and user-facing explanations.
set -euo pipefail
fail=0

# Detect nested if-else chain anti-pattern in feature logic files
hits=$(perl -ne '
  if (/\bif\b.*\{/ && !/\b(err|ctx|ok|exists|found|valid)\b/i) {
    my $file = $ARGV;
    my $line_num = $.;
    my $code = $_;
    if ($code =~ /if\s*\(.*(status|price|amount|tier|score|eligible|role|type|permission|rule|plan|quota|limit|discount|tax|fee).*\)/i) {
      unless ($code =~ /(\/\/ justified:|\/\* justified:)/) {
        print "$file:$line_num: $code";
      }
    }
  }
' $(find . -path '*/features/*' -name '*.go' -o -name '*.kt' -o -name '*.ts' -not -name '*_test.*' 2>/dev/null) 2>/dev/null || true)

if [ -n "$hits" ]; then
  echo "VIOLATION RULE-ENGINE-LEVELS-001: raw if-else decision branching found in feature code:"
  echo "$hits"
  echo "  → See §2 & §6: Business decision logic MUST use the 3-level Rules Engine:"
  echo "      - Level 1: Atomic rule (single condition -> single result)"
  echo "      - Level 2: Compound rule (AND / OR / NOT combination of Level 1 rules)"
  echo "      - Level 3: Policy (composed of Level 1 & Level 2 with custom resolver)"
  echo "  → Mandatory engine requirements: audit trail, debuggability trace, user-facing explanations."
  fail=1
fi

[ "$fail" -eq 0 ] && echo "PASS RULE-ENGINE-LEVELS-001"
exit $fail
