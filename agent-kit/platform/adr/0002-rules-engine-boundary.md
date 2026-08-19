# ADR-0002: Rules as Data and Evaluator Boundary

## Context
Embedding business branching in UI components or handlers leads to unmaintainable if/else trees and untestable code.

## Decision
All business branching and eligibility rules live as data files (`<feature>.<concern>.rules.yaml`) evaluated centrally via `platform/engine`.

## Consequences
- Zero business conditionals inside JSX or controllers.
- Rule evaluation is automatically traced with `rules.version` and facts count.
