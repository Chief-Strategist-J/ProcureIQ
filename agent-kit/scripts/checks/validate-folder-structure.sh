#!/usr/bin/env bash
# STRUCTURE-001 — strictly validates vertical-slice folder structure for Go, Kotlin, Next.js services.
# Rejects layered-architecture anti-patterns (flat controllers/, services/, models/ dirs).
# Exit 0 = pass, 1 = violation, 2 = no services found yet (skip).
set -euo pipefail
fail=0
found_any=0

# --- 1. Global Anti-Pattern Detection (applies across entire repository) ---
# Flat top-level dirs representing layered architecture are strictly banned
for d in $(find . -maxdepth 5 -type d 2>/dev/null | grep -E '(^|/)(controllers|services|models|repositories|handlers|helpers|utils)$' | grep -vE '(node_modules|vendor|\.git|__tests__|test|generated|platform|internal/platform)' || true); do
  # Only flag if it's NOT inside an authorized vertical slice or library directory
  if echo "$d" | grep -qvE '(features/|\(features\)/|adapters/|internal/|lib/|pkg/)'; then
    echo "VIOLATION STRUCTURE-001: layered-architecture anti-pattern detected: $d"
    echo "  → System must use vertical-slices: internal/features/<feature>/ (Go), features/<feature>/ (Kotlin), app/(features)/<feature>/ (Next.js)"
    fail=1
    found_any=1
  fi
done

# --- 2. Go Services (dirs containing go.mod) ---
while IFS= read -r -d '' gomod; do
  svc_root=$(dirname "$gomod")
  found_any=1
  echo "Checking Go service structure: $svc_root"

  # Required structural directories
  for required in "cmd" "internal/features" "internal/domain" "internal/ports" "internal/adapters" "internal/platform"; do
    if [ ! -d "$svc_root/$required" ]; then
      echo "VIOLATION STRUCTURE-001 [$svc_root]: missing required Go directory: $required"
      fail=1
    fi
  done

  # Banned flat dirs at service root
  for banned in "handlers" "controllers" "services" "models" "repositories" "helpers" "utils"; do
    if [ -d "$svc_root/$banned" ]; then
      echo "VIOLATION STRUCTURE-001 [$svc_root]: banned flat directory: $banned/ (use internal/features/<feature>/ instead)"
      fail=1
    fi
  done

  # Feature slice internal file discipline: inside internal/features/<feature>/
  # Flag files that recreate layered architecture inside slices (e.g. service.go, controller.go, repository.go)
  for feat_dir in $(find "$svc_root/internal/features" -mindepth 1 -maxdepth 1 -type d 2>/dev/null || true); do
    for bad_file in "service.go" "controller.go" "repository.go" "handler.go" "manager.go"; do
      if [ -f "$feat_dir/$bad_file" ]; then
        echo "VIOLATION STRUCTURE-001 [$feat_dir/$bad_file]: generic/layered filename in vertical slice."
        echo "  → Use verb-based files: <verb>_handler.go, <verb>_command.go, logic.go, rules.go, validate.go"
        fail=1
      fi
    done
  done
done < <(find . -name 'go.mod' -not -path '*/vendor/*' -not -path '*/.git/*' -print0 2>/dev/null)

# --- 3. Kotlin Services (dirs containing build.gradle.kts or build.gradle) ---
while IFS= read -r -d '' gradle; do
  svc_root=$(dirname "$gradle")
  if [ -f "$svc_root/settings.gradle.kts" ] || [ -f "$svc_root/settings.gradle" ] || [ "$svc_root" = "." ]; then
    found_any=1
    echo "Checking Kotlin service structure: $svc_root"

    # Check for vertical-slice dirs
    has_features=$(find "$svc_root" -maxdepth 3 -type d -name 'features' 2>/dev/null | head -1)
    has_domain=$(find "$svc_root" -maxdepth 3 -type d -name 'domain' 2>/dev/null | head -1)
    has_ports=$(find "$svc_root" -maxdepth 3 -type d -name 'ports' 2>/dev/null | head -1)

    if [ -z "$has_features" ]; then
      echo "VIOLATION STRUCTURE-001 [$svc_root]: missing 'features/' directory for vertical slices"
      fail=1
    fi
    if [ -z "$has_domain" ]; then
      echo "VIOLATION STRUCTURE-001 [$svc_root]: missing 'domain/' directory for pure entities"
      fail=1
    fi
    if [ -z "$has_ports" ]; then
      echo "VIOLATION STRUCTURE-001 [$svc_root]: missing 'ports/' directory for interfaces"
      fail=1
    fi

    # Banned flat dirs
    for banned in "controller" "controllers" "service" "services" "repository" "repositories" "model" "models"; do
      if find "$svc_root" -maxdepth 4 -type d -name "$banned" 2>/dev/null | grep -vE '(node_modules|\.git|build)' | grep -q .; then
        echo "VIOLATION STRUCTURE-001 [$svc_root]: banned flat directory: $banned/ (use features/<feature>/ instead)"
        fail=1
      fi
    done
  fi
done < <(find . \( -name 'build.gradle.kts' -o -name 'build.gradle' \) -not -path '*/vendor/*' -not -path '*/.git/*' -not -path '*/node_modules/*' -print0 2>/dev/null)

# --- 4. Next.js Web Services (dirs containing next.config.*) ---
while IFS= read -r -d '' nextcfg; do
  svc_root=$(dirname "$nextcfg")
  found_any=1
  echo "Checking Next.js service structure: $svc_root"

  # Required: app/ directory
  if [ ! -d "$svc_root/app" ]; then
    echo "VIOLATION STRUCTURE-001 [$svc_root]: missing 'app/' directory"
    fail=1
  fi

  # Required: lib/ directory
  if [ ! -d "$svc_root/lib" ]; then
    echo "VIOLATION STRUCTURE-001 [$svc_root]: missing 'lib/' directory (data fetching, rules, transforms go here)"
    fail=1
  fi

  # Banned: pages/api/ (old Next.js Pages router pattern)
  if [ -d "$svc_root/pages/api" ]; then
    echo "VIOLATION STRUCTURE-001 [$svc_root]: banned 'pages/api/' directory (use app/ router with route handlers)"
    fail=1
  fi

  # Banned: flat utils/, helpers/ (must be lib/transforms/ or lib/utils/)
  for banned in "utils" "helpers"; do
    if [ -d "$svc_root/$banned" ]; then
      echo "VIOLATION STRUCTURE-001 [$svc_root]: banned flat '$banned/' directory at service root (use lib/transforms/ instead)"
      fail=1
    fi
  done
done < <(find . \( -name 'next.config.ts' -o -name 'next.config.js' -o -name 'next.config.mjs' \) -not -path '*/node_modules/*' -not -path '*/.git/*' -print0 2>/dev/null)

if [ "$found_any" -eq 0 ]; then
  echo "SKIP STRUCTURE-001: no Go/Kotlin/Next.js service roots found yet"
  exit 2
fi

[ "$fail" -eq 0 ] && echo "PASS STRUCTURE-001"
exit $fail
