# ADR-0003: Centralized Error Taxonomy and Boundary Accumulation

## Context
Ad-hoc error strings and first-fail validation degrade API usability and prevent client error handling.

## Decision
- Error codes are centralized in `platform/errors/`.
- All boundary validators must accumulate ALL invalid field errors (`EitherNel`, `[]ValidationError`, zod issues).

## Consequences
- Clients receive complete validation feedback in a single round-trip.
- Zero ad-hoc error strings in feature code.
