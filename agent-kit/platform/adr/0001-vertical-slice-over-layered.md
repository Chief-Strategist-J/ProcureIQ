# ADR-0001: Vertical-Slice Architecture Over Layered Layouts

## Context
Layered architectures (flat `controllers/`, `services/`, `models/`, `repositories/`) create tight horizontal coupling and cross-feature sprawl.

## Decision
All services must be structured into independent vertical slices:
- Go: `cmd/`, `internal/features/<feature>/`, `internal/domain/`, `internal/ports/`, `internal/adapters/`, `internal/platform/`
- Kotlin: `platform/`, `domain/`, `features/<feature>/`, `ports/`, `adapters/`, `app/`
- Next.js: `app/(features)/<feature>/`, `lib/`, `components/ui/`

## Consequences
- Features are completely self-contained.
- Cross-feature direct imports are strictly banned.
- Shared infrastructure lives centrally under `platform/`.
