# ProcureIQ Agent Rules & Policies Reference

This document compiles and references all critical guidelines, folder structures, and coding standards defined across the `ProcureIQ` project. Every agent must read and adhere to these policies before planning, generating, or reviewing code.

---

## 🛑 Critical & Non-Negotiable Rules

The absolute non-negotiable rules for the project are defined in the [Critical Rules](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/critical.rule.md) policy. Key mandates include:

1. **No Assumptions**: Never make assumptions. If anything is unclear, ask the user.
2. **Contract-First Approach**: Always update/write contracts first, then database migration files, then the business logic.
3. **No Cross-Package Source Imports**: Sub-packages must be completely isolated.
4. **No Code From Scratch**: Use existing libraries and package methods instead of reinventing code.
5. **Distributed Tracing**: Always use OpenTelemetry for tracing.
6. **Log All Decisions**: Keep [change.log](file:///home/btpl-lap-22/live/ProcureIQ/logs/change.log) updated with an ASCII decision tree for every change.
7. **Write and Run Tests**: Always write test cases and run them after code modifications.

---

## 📁 Folder & API Structure Rules

All projects must strictly follow the defined directory layout and boundary policies:

* **[API-First Folder Structure](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/folderStructure/api-structure.md)**:
  * No code is written in `src/` until the API contract (OpenAPI, GraphQL SDL, AsyncAPI, or proto) is written and merged.
  * Structure defines `src/api/` for entrypoints, `src/features/` for pure business logic, and `src/infra/` for adapters and clients.
* **[Multiple Package Structure](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/folderStructure/package-structure.md)**:
  * Outlines language workspace layouts (Java, Python, Node, Go, Rust) and cross sub-package communication boundaries.
  * Sub-packages must be fully isolated; runtime calls go through versioned contracts and generated clients.
* **[Models Structure Rules](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/folderStructure/models-structure.md)**: Establishes separation between database entities, internal domain models, and API exchange DTOs.
* **[Feature Registry](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/folderStructure/feature-registry.md)**: Central directory mapping of all application features.

---

## 🛠️ Code Quality Policies

Every sub-package must satisfy strict code quality metrics:

* **[Coupling Strength Spectrum](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/codeQuality/coupling-strength-spectrum.md)** & **[Coupling Taxonomy](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/coupling-taxonomy.md)**: Guidelines on managing dependencies and avoiding high coupling.
* **[DRY (Don't Repeat Yourself)](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/codeQuality/dry.md)**: Standard duplication checks.
* **[Function Parameter Limit](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/codeQuality/function-parameter-limit-rule.md)**: Restricts function arguments to prevent signature pollution.
* **[Package Naming Rules](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/codeQuality/package-namming-rules.md)**: Standard capitalization and separator guidelines.
* **[Prototype Rules](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/codeQuality/prototype.md)**: Scoping policies for temporary or prototype modules.
* **[SRP (Single Responsibility Principle)](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/codeQuality/srp.md)**: Design policies ensuring single-purpose classes and modules.
* **[Typecasting Rules](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/codeQuality/typecasting-rules.md)**: Policies around type casting safety.

---

## 🤖 Agent Roles & Workflows

AI agents in this workspace follow a designated pipeline to plan, execute, and verify changes:

* **[Agent Policies Readme](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/agents/README.md)**:
  * Defines the three roles: **Policy Guardian**, **Code Generator**, and **Code Reviewer**.
  * Outlines the step-by-step workflow: *User Request -> Policy Guardian (Validate Plan) -> Code Generator (Implement) -> Code Reviewer (Audit) -> Commit*.
* **[Policy Guardian](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/agents/policy-guardian.md)**: Compliance validator. Performs pre-implementation and post-implementation validation.
* **[Code Generator](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/agents/code-generator.md)**: Implementation agent focused on writing compliant components.
* **[Code Reviewer](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/agents/code-reviewer.md)**: Review agent verifying generated code.

---

## 🔌 Networks & Migration

* **[mTLS Migration Strategy](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/networks/migration/mTLS_migration.md)**: Step-by-step migration procedures for network security.
* **[Decentralized Network Rules](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/networks/decentralized-network/critical.rule.md)**: Communication protocols for zero-trust architectures.

---

## 📝 Git & Runbook Rules

* **[Git Branch Naming Rules](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/git/git-branch-naming-rules.md)**: Strict naming formatting for git branches.
* **[ADR (Architectural Decision Records)](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/runbook/adr.md)**: How to document long-term design decisions.
* **[Feature Flag / Circuit Breaker](file:///home/btpl-lap-22/live/ProcureIQ/policies/rules/runbook/ffsb.md)**: Rules on feature flag controls and decoupling logic.
* **[Runtime Adaptor Pattern](file:///home/btpl-lap-22/live/ProcureIQ/policies/runtime-adaptor-pattern.md)**: Integration patterns.
