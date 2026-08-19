# AGENTS.md — Mandatory Architecture & Rules Specification

> **UNIVERSAL AGENT INSTRUCTION**: This file is read natively by Claude Code, Gemini CLI, Cursor, Windsurf, Copilot, Codex, and all autonomous coding agents. All rules in this document and `agent-kit/platform/rules-manifest.yaml` are **mechanically enforced, non-negotiable compile-time gates**.

---

## 1. Mandatory Execution Protocol (Every Agent Turn)

### Before writing or modifying ANY code:
1. **Read `agent-kit/platform/rules-manifest.yaml` in full.**
2. **Read every ADR under `platform/adr/`.** Do not silently contradict a prior decision.
3. **State out loud in your initial response** which exact Rule IDs from the manifest apply to your current task.
4. **Follow all 15 sections (§0 to §14) of the reference specification below.**

### After writing code, before claiming completion:
Run:
```bash
bash agent-kit/scripts/run-rules-manifest.sh --changed
```
- **`blocking` finding** → **STOP IMMEDIATELY**. Fix the violation before proceeding. Do NOT declare the task complete.
- **`required-with-justification` finding** → Surface explicitly to the user with formal justification.
- **Never claim a rule is satisfied without running the script and presenting the actual output.**

---

## 2. Mechanically Enforced Rule ID Matrix (40 Rules)

| Rule ID | Severity | Concern | Mechanism |
|---|---|---|---|
| `NAMING-001` | blocking | §0 Naming Law | `validate-naming.sh` |
| `NAMING-002` | blocking | §0 Rule File Naming | `validate-rule-file-naming.sh` |
| `STRUCTURE-001` | blocking | §1 & §2 Vertical Slice | `validate-folder-structure.sh` |
| `KT-NULL-001` | blocking | §3 Kotlin Null Safety | `no-force-unwrap-kotlin.sh` |
| `GO-ASSERT-001` | blocking | §3 Go Type Assertion | `no-unchecked-type-assertion-go.sh` |
| `GO-ERRCHECK-001` | blocking | §3 Go Error Handling | `go-errcheck.sh` |
| `GO-PANIC-001` | blocking | §3 Go Panic Ban | `no-panic-in-features-go.sh` |
| `TS-ANY-001` | blocking | §3 TypeScript `any` Ban | `no-any-typescript.sh` |
| `TS-ASSERT-001` | blocking | §3 TypeScript `as T` Ban | `no-unsafe-cast-typescript.sh` |
| `TS-STRICT-001` | blocking | §3 TSConfig Strictness | `validate-tsconfig-strict.sh` |
| `RESOURCE-TIMEOUT-001` | required* | §4 Explicit Timeouts | `no-default-timeouts.sh` |
| `LOOP-001` | blocking | §5 Functional Combinators | `no-loops-in-features.sh` |
| `CONFIG-SCHEMA-001` | blocking | §6 Config JSON Schema | `validate-config.sh` |
| `CONFIG-ACCESS-001` | blocking | §6 Typed Config Access | `no-string-config-access.sh` |
| `SECURITY-SECRET-001` | blocking | §6 Secret Scanning | `no-committed-secrets.sh` |
| `CENTRAL-001` | blocking | §9 Centralization Master List | `enforce-centralization-master-list.sh` |
| `ADR-COVERAGE-001` | blocking | §10 ADR Governance | `check-adr-coverage.sh` |
| `AGENT-LOOP-001` | blocking | §10 3-Agent Loop Citations | `validate-3-agent-loop-citations.sh` |
| `UI-LOGIC-001` | blocking | §11 Frontend Logic Ban | `no-business-logic-in-jsx.sh` |
| `UI-TRANSFORM-001` | blocking | §11 Frontend Transforms | `no-data-transforms-in-components.sh` |
| `UI-MAGIC-VALUES-001` | blocking | §11 Frontend Magic Values | `no-magic-values-in-components.sh` |
| `UI-FETCH-001` | blocking | §11 Frontend Direct Fetch | `no-fetch-in-components.sh` |
| `UI-STYLE-001` | required* | §11 Design Tokens | `no-inline-style-values.sh` |
| `UI-INLINE-STYLE-001` | blocking | §11 Inline Style Ternary | `no-inline-style-ternary.sh` |
| `UI-CROSS-IMPORT-001` | blocking | §11 Slice Isolation | `no-cross-feature-imports.sh` |
| `UI-COMPONENT-SIZE-001` | advisory | §11 Component Size (<100L) | `check-component-size.sh` |
| `DB-MIGRATION-001` | blocking | §12 Additive Migrations | `lint-migrations.sh` |
| `DB-MIGRATION-002` | blocking | §12 Destructive Migration ADR | `lint-migrations.sh` |
| `DB-MIGRATION-003` | blocking | §12 Idempotent Migrations | `lint-migrations-idempotent.sh` |
| `DB-RLS-001` | blocking | §12 Row-Level Security (RLS) | `lint-migrations-rls.sh` |
| `DB-TENANT-001` | blocking | §12 Tenant Query Parameter | `no-unscoped-queries.sh` |
| `DB-COMPAT-001` | blocking | §12 Schema Compatibility Window | `validate-db-compat-window.sh` |
| `DB-STATEMENT-TIMEOUT-001`| blocking | §12 Query Statement Timeout | `check-db-statement-timeout.sh` |
| `REPLICA-CONSISTENCY-001` | blocking | §12 Replica Read Consistency | `check-replica-consistency-param.sh` |
| `API-IDEMPOTENCY-001` | blocking | §13 OpenAPI Idempotency-Key | `require-idempotency-key-openapi.sh` |
| `DB-IDEMPOTENCY-001` | blocking | §13 DB Idempotency Constraints | `lint-idempotency-table.sh` |
| `API-CONCURRENCY-001` | required* | §13 OpenAPI If-Match/ETag | `require-etag-openapi.sh` |
| `OUTBOX-PATTERN-001` | blocking | §13 Transactional Outbox | `no-uncoordinated-event-publish.sh` |
| `ID-TAXONOMY-001` | blocking | §14 21+ Identifier Taxonomy | `validate-identifier-taxonomy.sh` |
| `DEP-PIN-001` | blocking | §16 Dependency Pinning | `no-floating-deps.sh` |

---

## 3. Complete Authoritative Architecture Specification (§0 to §14)

# Data-Driven, Rules-Engine, Vertical-Slice Architecture — v2
### Kotlin + Go + Next.js — generic, brutal, complete

Corrections from v1 applied: **no domain-specific names anywhere in this doc.** Every folder/interface/rule below is a placeholder — `<feature>`, `<Feature>`, `<Entity>`, `<Aggregate>`. If you paste `OrderRepository` into your actual codebase because you saw "Order" as an example, you already violated the rule. The pattern is: **the repository/port is named after the feature/aggregate it serves, discovered from YOUR domain, never copied from a doc.** `<Feature>Repository`, not `OrderRepository`. `<Feature>Rules`, not `PricingRules`. This document contains **zero concrete nouns** from here on.

---

## 0. The naming law (this is why v1 was wrong)

- A port/interface is named `<Feature>Repository`, `<Feature>Publisher`, `<Feature>Cache` — `<Feature>` is whatever vertical slice owns it. Never hardcode an example noun as if it's structural.
- A rule file is named `<feature>.<concern>.rules.yaml` (`<concern>` = validation | pricing-like-decision | workflow | eligibility — again, `<concern>` is discovered per-domain, not copied).
- **Rule enforcement:** any generated code, any AI-generated slice, any doc/template MUST use `<Feature>`/`<Entity>`/`<Concern>` placeholders until a human or the codegen step substitutes the real name. This is enforced by Agent 2 in §10 — a reviewer agent that rejects any scaffold containing a copy-pasted example noun from a template/doc.

---

## 1. Repo-level topology

```
platform/
├── contracts/{openapi,proto,jsonschema}/
├── infra/
│   ├── terraform/
│   ├── k8s/{base, overlays/{dev,staging,prod}}
│   ├── docker/
│   └── observability/            # OTel collector, dashboards, alert rules — §7
├── config/                        # §6
│   ├── base.yaml
│   ├── env/{dev,staging,prod}.yaml
│   ├── secrets.ref.yaml           # POINTERS to a secret store, never actual secret values
│   ├── rules/<feature>.<concern>.rules.yaml
│   └── schema/*.schema.json
├── adr/                            # Architecture Decision Records — §10
│   ├── 0001-vertical-slice-over-layered.md
│   ├── 0002-rules-engine-boundary.md
│   ├── 0003-error-taxonomy-format.md
│   └── TEMPLATE.md
├── ci/                              # §8 — pipeline definitions, reusable across services
│   ├── pipelines/{lint.yml, typecheck.yml, unit.yml, integration.yml, contract.yml, perf.yml, security.yml, deploy.yml}
│   └── gates/README.md              # what blocks merge vs what blocks deploy
└── scripts/
    ├── gen-contracts.sh
    ├── validate-config.sh
    ├── validate-naming.sh           # rejects literal example nouns / non-placeholder scaffolds
    └── check-adr-coverage.sh        # fails CI if a structural change has no linked ADR

services/
├── go-svc/
├── kotlin-svc/
└── web/

tests/
├── integration/
├── contract/
└── perf/
```

---

## 2. Service structures (fully generic)

### 2a. Go

```
go-svc/
├── cmd/{api,worker}/main.go
├── internal/
│   ├── features/
│   │   └── <feature>/
│   │       ├── <verb>_handler.go        # e.g. create_handler.go, list_handler.go — verb, not noun-guessing
│   │       ├── <verb>_command.go
│   │       ├── <verb>_result.go
│   │       ├── logic.go                 # pure: (Command, Deps) -> (Result, error)
│   │       ├── rules.go                 # facts-mapper for engine
│   │       ├── validate.go              # boundary validation — §5
│   │       ├── <verb>_handler_test.go
│   │       └── <verb>_integration_test.go
│   ├── domain/
│   │   └── <entity>.go                  # pure type + invariants
│   ├── ports/
│   │   └── <feature>_repository.go      # interface <Feature>Repository
│   ├── adapters/{postgres,kafka,redis}/<feature>_<adapter>.go
│   ├── engine/{loader.go,evaluator.go,registry.go}
│   └── platform/{tracing,config,errors,middleware,fp}/
├── pkg/
└── go.mod
```

### 2b. Kotlin

```
kotlin-svc/
├── platform/{tracing,config,errors,engine,http}/
├── domain/<Entity>.kt
├── features/<feature>/
│   ├── <Verb><Feature>Route.kt
│   ├── <Verb><Feature>Command.kt
│   ├── <Verb><Feature>Handler.kt         # suspend fun handle(cmd): Either<AppError, Result>
│   ├── <Verb><Feature>Rules.kt
│   ├── <Verb><Feature>Validation.kt
│   └── test/
├── ports/<Feature>Repository.kt
├── adapters/{postgres-exposed,kafka,redis}/
└── app/Application.kt
```

### 2c. Next.js

```
web/
├── app/(features)/<feature>/{page.tsx, actions.ts, schema.ts, hooks.ts, components/, __tests__/}
├── lib/
│   ├── data/{client.ts, <feature>.ts, generated/}
│   ├── rules/evaluator.ts
│   ├── config/index.ts
│   ├── errors/AppError.ts
│   ├── tracing/otel.ts
│   ├── validation/{guards.ts, invariants.ts}   # §5
│   └── transforms/
├── components/ui/
└── middleware.ts
```

---

## 3. Brutal type-safety, null-safety, empty/invalid-data rules

This is the part most "clean architecture" docs wave hands at. Not here.

### The 4 boundary questions, asked at EVERY function that crosses a layer (handler → logic, logic → port, port → adapter, adapter → external system)

1. **Is this value the type I declared, or did something upstream lie to me (JSON, DB row, env var)?**
2. **Is this collection empty, and does empty mean "valid, nothing to do" or "invalid, upstream broke"?** — these are NOT the same and conflating them is the #1 source of silent data bugs.
3. **Is this value `null`/`nil`/`undefined`, and did I decide that on purpose or did I just forget?**
4. **If this is a number/string, is it in-range/non-garbage** (negative age, empty string where a code is required, NaN, `Infinity`, a UUID that isn't actually a UUID)?

### Kotlin — enforced by the compiler, but only if you don't cheat

- **Ban `!!` outside of test code — CI grep-fails the build if `!!` appears in `features/`, `domain/`, `adapters/`.** Use `?:` with an explicit `AppError`, or `requireNotNull(x) { "reason" }` at a boundary where "this must never be null" is itself a documented invariant.
- **Ban platform types leaking from Java interop without an explicit wrap.** Anything crossing a Java library boundary gets wrapped in a `data class` with Kotlin-native nullability the same day it's introduced — never let `String!` propagate through your domain.
- Every DTO parsed from JSON goes through **validation at the boundary** (`<Verb><Feature>Validation.kt`) that returns `Either<NonEmptyList<AppError>, Command>` (Arrow's `Validated`/`EitherNel` to **accumulate every invalid field**, not just fail on the first one — a form with 3 bad fields should report 3 errors, not 1).
- Empty collections: **never `List<T>?` — always `List<T>` defaulting to `emptyList()`.** A nullable list is a design smell; "no items" and "items unknown" must be two different types (`List<T>` vs `Option<List<T>>`) if that distinction genuinely matters, never encoded as `null` vs `[]`.
- Numeric/string invariants live as **value classes** (`@JvmInline value class OrderQuantity private constructor(val value: Int)`, with a `companion object` smart constructor that returns `Either<AppError, OrderQuantity>` — invalid values literally cannot be constructed).

### Go — the compiler won't save you, so process must

- **Every function returning `(T, error)` — the caller checks `error` before touching `T`, no exceptions.** CI runs `errcheck` and fails the build on any ignored error return.
- **Zero-value ambiguity is a Go trap: `0`, `""`, `false`, `nil` are all valid AND "not set."** Rule: any field where zero-value is ambiguous gets a pointer (`*int`) or an explicit `Present bool` wrapper — never rely on "if it's 0 it wasn't set."
- **Ban naked `nil` map/slice access patterns that panic.** Always check `len(s) == 0` before indexing; never assume a slice passed into a function is non-nil — `nil` slices are valid and `len(nil) == 0` in Go, so treat "nil" and "empty" as THE SAME THING for slices (unlike Kotlin's List?/List distinction) — but document that decision at the port boundary.
- Use `govulncheck` + `staticcheck` + `go vet` in CI, not optionally — these catch nil-deref patterns and unchecked type assertions (`x.(string)` without the `, ok` form is a CI-blocking finding).
- Boundary validation: every `<verb>_command.go` has a `Validate() []ValidationError` method that collects ALL invalid fields (not first-fail) — same accumulation principle as Kotlin.
- **Never `panic` in `features/` or `domain/` for expected failure modes.** `panic`/`recover` exists only in `platform/middleware` as the last-resort safety net that converts an unexpected panic into a 500 + traced error — it is not a control-flow tool.

### TypeScript / Next.js — `strict: true` is the floor, not the ceiling

- `tsconfig.json`: `"strict": true`, `"noUncheckedIndexedAccess": true` (this alone kills a huge class of "array might be empty" bugs — `arr[0]` becomes `T | undefined`, forcing you to handle it), `"exactOptionalPropertyTypes": true`.
- **`any` is banned via ESLint (`@typescript-eslint/no-explicit-any` as `error`, not `warn`).** `unknown` + a type guard/zod parse is the only legal escape hatch for genuinely untyped input (JSON from `fetch`, `JSON.parse`, external webhooks).
- **Every external boundary is a zod `.parse()` call, not a type assertion.** `as Feature` is a lie you tell the compiler; `schema.parse(data)` is a runtime check that actually protects you. Feature `schema.ts` files are the single source of both compile-time types (`z.infer<typeof schema>`) and runtime validation — one definition, not two that can drift.
- Empty vs missing: model with zod explicitly — `z.array(x).min(1)` when empty is invalid, plain `z.array(x)` (defaulting `[]`) when empty is a valid "nothing yet" state. Never `.nullable().optional()` stacked on an array "just in case" — decide which state is real.
- `zod` refine/superRefine for numeric/string invariants (range checks, format checks) at the SAME layer as the type definition — not scattered into component logic later.

### Cross-language invariant: accumulate, don't short-circuit, at input boundaries

Every boundary validator across all three languages returns **all failures**, not the first one. Short-circuiting is fine deep inside pure logic (`fold`/`reduce` early exits) — it's a UX and debuggability failure at the edge where a human or client is submitting data.

---

## 4. End-to-end tracing — done right, or don't bother

You're correct: a trace that only covers "HTTP in → HTTP out" is nearly useless. If validation silently drops 40ms and you can't see it, the trace lied to you. The goal: **one trace_id from the moment a request enters Next.js middleware to the moment a DB row commits or an event lands on a broker — every layer, every function that matters, visible as a child span under the same root.**

### The mechanism (not manual, this is the whole point)

You do **not** hand-write `span.start()`/`span.end()` in every function. That's how tracing rots — someone forgets, coverage degrades silently. Instead:

1. **Ambient context propagation is mandatory per language:**
   - Go: `context.Context` is the FIRST parameter of every function that does I/O or calls into `engine`/`ports` — no exceptions, `go vet` custom lint fails a PR that drops `ctx`.
   - Kotlin: coroutine context carries the OTel `Span` via `Context.current()`; every `suspend fun` in `features/`/`engine`/`adapters` inherits it automatically through structured concurrency — you never manually thread a trace object as a parameter.
   - Next.js: OTel's `AsyncLocalStorage`-based context (via `@vercel/otel` or manual SDK) — `middleware.ts` starts the root span once, everything downstream (server actions, `lib/data` calls) inherits it.

2. **One decorator/wrapper per layer boundary, applied centrally, not per-function:**
   - `platform/engine` (all 3 langs): the rule **evaluator** wraps every ruleset evaluation in a span named `engine.evaluate.<ruleset>` with attributes `rules.version`, `facts.count`, `actions.emitted` — this is written ONCE inside the engine runtime, so every feature's rule evaluation is traced automatically, with zero per-feature code.
   - `features/<feature>` boundary validators: wrapped by a single `withValidationSpan()` helper (Go: higher-order function; Kotlin: an inline function wrapping the `Either` chain; TS: a wrapper around `schema.parse`) — span name `validate.<feature>.<verb>`, attributes = which fields failed.
   - `ports` calls: the **adapter constructor**, not each call site, wraps every method with a span (`repository.<feature>.<method>`, `publisher.<feature>.<method>`) — implemented via a generic decorator/proxy pattern once in `platform/adapters/base`, so a new adapter gets tracing for free by embedding the base.
   - `platform/http` client: every outbound HTTP call gets a span automatically (`http.client.<host>.<method>`) — this is the ONE http client factory from v1, and it is where trace-context injection into outgoing headers (`traceparent`) happens, so the NEXT service picks up the SAME trace, not a new one.

3. **Span naming convention (enforced by Agent 2, §10):** `<layer>.<feature>.<action>` — `handler.<feature>.create`, `logic.<feature>.create`, `validate.<feature>.create`, `engine.evaluate.<feature>.<concern>`, `repository.<feature>.save`, `publisher.<feature>.emit`. A trace waterfall for one request should read top-to-bottom exactly like the call stack: handler → validate → logic → engine.evaluate → repository/publisher — because the span names mirror the real function-call hierarchy, not an approximation of it.

4. **What gets a span vs what doesn't:** anything that (a) does I/O, (b) evaluates a rule, (c) is a function whose latency variance you'd ever want to diagnose. Pure in-memory helpers (`map`/`filter`/`fold` calls, a 3-line pure transform) do NOT get individual spans — that's noise, not signal. The line: **if you'd never `grep` for this function's timing in an incident, it doesn't need a span.**

5. **Log-trace-metric correlation is automatic, not manual:** OTel SDK config (once, in `platform/tracing/init`) auto-injects `trace_id`/`span_id` into every structured log line and every metric exemplar. A dev debugging an incident goes: metric spike → exemplar → trace_id → full waterfall → the exact validation/rule/DB span that was slow — without writing a single manual correlation line anywhere in feature code.

6. **Sampling:** head-based sampling (e.g. 10% in prod) is fine for volume — but **always 100% sample any trace that ends in an error or a rule-engine "reject"/"flag" action.** This is a config value (`platform/config/base.yaml: tracing.errorSampleRate: 1.0`), not a per-feature decision.

### End-to-end example (still fully generic)

```
[trace_id: abc123]
 └─ http.server.web.middleware                (Next.js, root span)
     └─ http.client.go-svc.POST /<feature>     (Next.js lib/data/client.ts)
         └─ handler.<feature>.create           (Go)
             └─ validate.<feature>.create      (Go) — attrs: fields_checked=6, fields_failed=0
             └─ logic.<feature>.create         (Go)
                 └─ engine.evaluate.<feature>.validation   — attrs: rules.version=3, actions=[]
                 └─ engine.evaluate.<feature>.<concern>    — attrs: rules.version=7, actions=[flag_review]
                 └─ repository.<feature>.save              (Go → Postgres adapter)
                 └─ publisher.<feature>.emit                (Go → Kafka outbox)
```

One waterfall. One trace_id. Every layer, including validation and rule evaluation — exactly the requirement.

---

## 5. Method-list cheat sheet — stop writing loops, full depth

The whole point of "transform/map/where/fold/reduce/pipe" is: **a `for` loop appearing in a feature slice is a code-review rejection.** Zero exceptions for `features/`, `domain/`, `logic.go`/`Handler.kt`/`actions.ts`. A loop is only ever legal inside `platform/fp` itself (where the generic `Map`/`Filter`/`Reduce` helpers are implemented once) or inside a true low-level adapter doing byte-level work. If you catch yourself typing `for (` or `for _, x := range` or `for (const x of` anywhere in a feature slice, stop and find the combinator instead — it exists, in every case below.

### Kotlin (`kotlin.collections` + `kotlin.sequences`, all stdlib — no Arrow needed for these)

| Need | Function |
|---|---|
| transform each | `map`, `mapNotNull`, `mapIndexed`, `mapIndexedNotNull`, `flatMap` |
| filter | `filter`, `filterNot`, `filterIsInstance<T>`, `filterNotNull` |
| reduce to scalar | `fold(initial) { acc, x -> }`, `foldRight`, `reduce`, `reduceOrNull`, `runningFold`, `scan`, `sumOf`, `count`, `maxByOrNull`, `minByOrNull`, `maxOfOrNull` |
| grouping/bucketing | `groupBy`, `groupingBy().eachCount()`, `groupingBy().fold()`, `groupingBy().aggregate()`, `associate`, `associateBy`, `associateWith` |
| partitioning | `partition { }` → `Pair<List,List>` |
| combining collections | `zip`, `zipWithNext`, `plus`, `unzip` (reverse of zip) |
| flattening | `flatten` (List<List<T>> → List<T>) |
| chunking/windowing (batch jobs, rate limiting) | `chunked(n)`, `windowed(n, step)` |
| take/drop (streaming, pagination-style slicing) | `take`, `takeWhile`, `drop`, `dropWhile`, `takeLast`, `dropLast` |
| short-circuit checks | `any`, `all`, `none`, `find`, `findLast`, `firstOrNull`, `lastOrNull`, `singleOrNull` |
| ordering | `sortedBy`, `sortedByDescending`, `sortedWith(compareBy{}.thenBy{})` |
| distinctness | `distinct`, `distinctBy` |
| lazy pipelines (large/infinite data, avoid intermediate allocations) | `.asSequence().map{}.filter{}.toList()` |
| scoping / fluent pipe (no native `\|>`, use `.let`) | `x.let(::step1).let(::step2)`, `with(x) { }`, `x.also { sideEffect(it) }`, `x.apply { mutateSelf() }`, `x.run { }` |
| null-safe chains | `?.let { }`, `?:`, `?.also { }`, `?.takeIf { }` |
| resource closing (no manual try/finally) | `use { }` |
| error-as-value (Arrow) | `Either<E,A>.map`, `.flatMap`, `.fold(ifLeft, ifRight)`, `.mapLeft`, `.zip`, `.traverse`; `Validated`/`EitherNel` (accumulate multiple errors — critical for form-validation slices); `Option.map`/`.getOrElse`; `NonEmptyList` (make "must have ≥1 item" a TYPE, not a runtime `if`) |

### Go (stdlib `slices`/`maps`/`cmp` since Go 1.21, `iter` since 1.23 — avoid a heavy `lo` dependency unless team lacks generics fluency)

| Need | Function |
|---|---|
| transform | no native `Map` on slices — write ONE generic helper in `platform/fp`: `func Map[T,U any](s []T, f func(T) U) []U` and reuse everywhere. Same for `Filter`, `Reduce`. This is the **one deliberate exception**: Go's stdlib genuinely lacks these, so you write them once, centrally, never per-feature. |
| filter (your own `platform/fp`) | `func Filter[T any](s []T, pred func(T) bool) []T` |
| reduce/fold (your own `platform/fp`) | `func Reduce[T,U any](s []T, init U, f func(U,T) U) U` |
| group/partition (your own `platform/fp`) | `func GroupBy[T any, K comparable](s []T, key func(T) K) map[K][]T`, `func Partition[T any](s []T, pred func(T) bool) (yes, no []T)` |
| zip (your own `platform/fp`) | `func Zip[A,B any](a []A, b []B) []Pair[A,B]` |
| sort | `slices.Sort`, `slices.SortFunc`, `slices.SortStableFunc`, `slices.Reverse` |
| search | `slices.Contains`, `slices.ContainsFunc`, `slices.Index`, `slices.IndexFunc`, `slices.BinarySearchFunc` |
| mutate-safe ops | `slices.Insert`, `slices.Delete`, `slices.DeleteFunc`, `slices.Replace` |
| dedupe | `slices.Compact`, `slices.CompactFunc` |
| dedupe+sort combo | `slices.Sort` + `slices.Compact` |
| equality | `slices.Equal`, `slices.EqualFunc` |
| min/max | `slices.Max`, `slices.Min`, `slices.MaxFunc`, `slices.MinFunc` |
| concat/clone | `slices.Concat`, `slices.Clone` |
| chunking/batching | `slices.Chunk` (1.23+) |
| comparisons | `cmp.Compare`, `cmp.Or` (chain comparators without nested `if`) |
| map ops | `maps.Keys`, `maps.Values` (iterators, 1.23+), `maps.Clone`, `maps.Copy`, `maps.DeleteFunc`, `maps.Equal` |
| lazy/composable pipelines | `iter.Seq[T]` / `iter.Seq2[K,V]` (Go 1.23 range-over-func) — chain stages without materializing intermediate slices |
| concurrent fan-out/fan-in | `golang.org/x/sync/errgroup` — `g.Go(func() error {...})` + `g.Wait()` + `g.SetLimit(n)`, NOT raw `sync.WaitGroup` (errgroup gives you first-error propagation + context cancellation + bounded concurrency for free) |
| once/memoize | `sync.Once`, `sync.OnceFunc`, `sync.OnceValue` (1.21+) — instead of a hand-rolled `if !initialized` check |

> Go verdict: you will write ~60–80 lines of generic `Map/Filter/Reduce/GroupBy/Partition/Zip` **once** in `platform/fp/functional.go` and that satisfies "no loops" for the whole org. Don't reach for `samber/lo` unless the team explicitly wants a lodash-style API surface — it's a real dependency risk for marginal gain over your own generics, but if the team is small and wants zero maintenance burden on `platform/fp`, `samber/lo` is a legitimate, actively maintained alternative — pick one and never mix both in the same repo.

### TypeScript / Next.js (native `Array.prototype` + `Object`/`Map` — reach for `fp-ts`/Ramda only for the rules engine and complex pipelines)

| Need | Function |
|---|---|
| transform | `.map`, `.flatMap` |
| filter | `.filter` |
| reduce | `.reduce`, `.reduceRight` |
| find/check | `.find`, `.findLast`, `.findIndex`, `.findLastIndex`, `.some`, `.every`, `.includes`, `.at(index)` (supports negative indices — no manual `arr[arr.length-1]`) |
| flatten | `.flat(depth)`, `.flatMap` |
| grouping | `Object.groupBy` (ES2024) or `Map.groupBy` (when keys aren't strings) |
| dedupe | `[...new Set(arr)]` for primitives, or `[...new Map(arr.map(x => [x.id, x])).values()]` for dedupe-by-key on objects |
| sort (non-mutating, prefer over legacy `.sort()`) | `.toSorted()`, `.toReversed()`, `.toSpliced()`, `.with(index, value)` (ES2023 — all non-mutating, avoid the classic "sort mutated my original array" bug class entirely) |
| object transforms | `Object.entries`, `Object.fromEntries`, `Object.keys().map()`, `Object.values()`, `Object.hasOwn` (safer than `in`/`hasOwnProperty`) |
| deep copy (no manual recursive clone) | `structuredClone` |
| slicing/pagination | `.slice`, `.splice` only inside adapters, never to "fake a loop" in a feature |
| async transforms | `Promise.all(arr.map(fn))` (fail-fast fan-out), `Promise.allSettled` (partial-failure-tolerant fan-out — inspect `.status` per result instead of a try/catch loop), `Promise.any`, `Promise.race` |
| pipe/compose (native has none) | write `pipe(...)`/`flow(...)` once in `lib/transforms/pipe.ts`, OR import `fp-ts`'s `pipe`/`flow` if you're already using `Either`/`TaskEither` there for error-handling parity with Kotlin's Arrow |
| error-as-value (fp-ts, inside `lib/rules` + `lib/transforms` where chains matter) | `Either.map`, `.chain`, `.fold`, `TaskEither` (async + error-as-value combined — the async twin of Kotlin's `suspend fun ...: Either<...>`), `Option.map`/`.getOrElse`, `Array.filterMap` (map+filter in one pass, skips `undefined`/`None` results), `NonEmptyArray` (type-level "must have ≥1 item," same idea as Kotlin's `NonEmptyList`) |

**The cross-language equivalence table (so a dev moving between the three doesn't reinvent a name):**

| Concept | Kotlin | Go | TypeScript |
|---|---|---|---|
| map | `map` | `fp.Map` | `.map` |
| filter | `filter` | `fp.Filter` | `.filter` |
| fold/reduce | `fold` | `fp.Reduce` | `.reduce` |
| group by key | `groupBy` | `fp.GroupBy` | `Object.groupBy` |
| split by predicate | `partition` | `fp.Partition` | manual via two `.filter` (or your own `partition` helper in `lib/transforms`) |
| batch into windows | `chunked` | `slices.Chunk` | your own `chunk` helper in `lib/transforms` (no native equivalent) |
| error as value | `Either` (Arrow) | `(T, error)` idiom | `Either`/`TaskEither` (fp-ts) |
| non-empty list as a type | `NonEmptyList` | no native equivalent — validate `len > 0` at boundary, return error | `NonEmptyArray` (fp-ts) |
| bounded concurrent fan-out | `coroutineScope` + `async` + `awaitAll` (or `Flow` + `buffer`) | `errgroup.Group` + `SetLimit` | `Promise.all` over a chunked/limited batch (use `p-limit`-style bounding, don't fan out unbounded) |

---

## 6. Config management — this is the part AI (and humans) get wrong the most

Config isn't "a yaml file." It's a **layered, schema-validated, precedence-ordered, auditable system**, and the reason it matters more than any other section here: rules, feature flags, thresholds, and error taxonomies ALL live in it — if config management is sloppy, everything downstream (rules engine, error handling, tracing sample rates) inherits the sloppiness.

### Precedence order (highest wins), fixed and documented in `platform/config/README.md`

1. Runtime override (feature-flag service / admin toggle, if you have one) — highest, hot-reload, no deploy.
2. Environment variables (secrets, per-deploy overrides — injected by CI/CD, never committed).
3. `env/{env}.yaml` (per-environment overrides, committed, reviewed).
4. `base.yaml` (defaults, committed).
5. Hardcoded fallback in the loader (last resort, must log a WARNING every time it's hit — a hardcoded fallback being reached in prod is itself an incident signal).

### Rules, not just structure

- **Every config field is in `schema/*.schema.json`. A field that exists in a yaml file but not in the schema fails CI.** A field in the schema but never read by any service fails a separate "orphan config" lint (config drift in the other direction).
- **No secret ever lives in yaml.** `secrets.ref.yaml` holds references (`vault://path`, `ssm://path`), resolved at boot by the loader — CI has a regex gate that fails the build if anything matching a credential/key pattern appears in a committed config file.
- **Config is versioned and the version is embedded in every trace span and every log line** (`config.version` attribute) — exactly like the rules engine's `rules.version`. When behavior changes, you can always answer "which config generation was live" without guessing.
- **Hot-reload is explicit and scoped.** Not everything should hot-reload (a DB pool size probably needs a restart; a rule threshold should hot-reload). The schema marks each field `reloadable: true/false`; the loader only re-reads reloadable fields on a `SIGHUP`/webhook signal, and logs a diff of what changed.
- **Typed access only, in every language.** No `config["some_key"]` string-indexed access anywhere in `features/`. The loader produces a typed struct/data class/zod-inferred type ONCE, and that's the only thing feature code ever imports.
- **Config changes are reviewed like code** — `env/prod.yaml` changes go through the same PR + CI (`validate-config.sh`, schema check, diff-against-schema, naming lint) as a code change. No "just edit the config in the console" path to prod, ever.
- **Local dev override file** (`env/local.yaml`, gitignored) layers on top of `dev.yaml` for individual developer overrides without polluting the shared file.

---

## 7. Empty/invalid-data check summary table (all 3 languages, side by side)

| Check | Kotlin | Go | TypeScript |
|---|---|---|---|
| Non-null enforced | Type system (`T` vs `T?`) + ban `!!` | Explicit `if x == nil` / pointer discipline | `strict: true`, no `any`, zod `.parse` |
| Empty vs missing collection | `List<T>` (empty ok) vs `Option<List<T>>` (unknown) | `nil` slice == empty slice; document intent at boundary | `z.array(x)` (empty ok) vs `z.array(x).optional()` (missing) |
| Must-have-≥1 item | `NonEmptyList<T>` (Arrow) | `[]T` + explicit `len(x)==0` guard at boundary, return error | `z.array(x).min(1)` |
| Invalid numeric range | value class w/ smart constructor | validate in `Validate()`, return `[]ValidationError` | zod `.refine()`/`.min()/.max()` |
| Accumulate all errors at boundary | `Validated`/`EitherNel` | `[]ValidationError` slice, keep validating past first fail | zod `safeParse` + `.error.issues` (all issues, not first) |
| Unchecked type assertion | N/A (compiler-enforced) | ban bare `x.(T)`, require `x, ok := x.(T)` | ban `as T`, require `schema.parse`/type guard |
| Silent panic/exception on bad data | banned in `features`/`domain` | banned in `features`/`domain`, only `platform/middleware` recovers | never throw raw in a feature; return `Result`/zod error |

---

## 8. CI/CD structure

```
.github/workflows/  (or equivalent — Gitlab CI / Buildkite, same shape)
├── pr.yml                  # runs on every PR — FAST gates only, must pass to merge
│   stages: lint → typecheck → unit-test → validate-config → validate-naming
│                            → check-adr-coverage → contract-test → build
├── main.yml                # runs on merge to main
│   stages: [pr.yml gates] → integration-test → security-scan (SAST + dep audit)
│                            → build-images → push-images → deploy:dev → smoke-test:dev
├── nightly.yml              # slow, non-blocking-to-merge
│   stages: cross-service-integration → perf-test → soak-test(long) → dependency-freshness-check
├── release.yml               # manual/tag-triggered
│   stages: deploy:staging → contract-test:staging → perf-gate:staging(compare vs baseline)
│            → manual-approval → deploy:prod(canary %) → auto-rollback-on-SLO-breach
│            → deploy:prod(full) → tag-release-in-ADR-log
└── agents.yml                 # §10 — generator/reviewer/cross-checker AI loop, PR-triggered
```

**Gate philosophy (brutal, non-negotiable):**
- **Merge-blocking (must be green on every PR, <10 min):** lint, typecheck, unit tests, config schema validation, naming-convention lint, ADR-coverage check, contract tests, `!!`/`any`/unchecked-assertion grep gates.
- **Deploy-blocking (must be green before prod, can be slower):** integration tests, security scan, perf-gate vs baseline, canary SLO check.
- **Non-blocking but visible (nightly, dashboarded):** soak tests, dependency freshness, cross-service integration matrix.
- **Every environment overlay (`k8s/overlays/{env}`) is deployed via the SAME pipeline definition with env as a parameter — never a hand-maintained separate pipeline per environment**, or dev/staging/prod WILL drift.
- **Rollback is automatic, not a runbook step:** canary deploy watches error-rate/latency SLOs (sourced from `platform/config/perf-budgets.yaml`, same file perf tests use) for N minutes; breach triggers auto-rollback, no human required to notice first.

---

## 9. Everything centralized — the actual master list

If it appears more than once anywhere in `features/`, it's a bug, not a pattern:

| Concern | Centralized in | Never duplicated in |
|---|---|---|
| Tracing init + span decorators | `platform/tracing`, `platform/engine`, `platform/adapters/base`, `platform/http` | any `features/<feature>/*` |
| Config loading/typing | `platform/config` loader, one typed struct | string-indexed config reads anywhere else |
| Error codes/taxonomy | `platform/errors` (generated from `error-codes.yaml`) | hand-typed error strings in feature code |
| Validation accumulation pattern | one `withValidationSpan`/`Validated` helper per language | per-feature bespoke validation loops |
| HTTP client (retry, breaker, tracing) | `platform/http` factory | `new HttpClient()`/`fetch()` calls inside a feature |
| Rules engine runtime | `platform/engine` (loader/evaluator/registry) | feature-local if/else chains for business rules |
| Auth/rate-limit/CORS/request-id | API gateway + `middleware.ts`/Go+Kotlin middleware, applied once | per-route auth checks |
| DB pool/connection mgmt | `adapters/<store>/base` | per-feature DB client construction |
| CI pipeline definitions | `platform/ci/pipelines/*.yml`, reused per service | copy-pasted workflow yaml per service |
| Naming/structure enforcement | `scripts/validate-naming.sh` + Agent 2 (§10) | code review tribal knowledge |

---

## 10. AI can't remember — build the process assuming that, not hoping otherwise

You're right, and this is the most important section. An LLM has no persistent memory of "why we decided X" across sessions unless you force it to read that decision back in every time. Two mechanisms, used together:

### A. Architecture Decision Records (`platform/adr/`) — the persistent memory the AI doesn't have

- Every structural decision (vertical-slice-over-layered, rules-engine-boundary, error-taxonomy-format, tracing-span-convention, config-precedence-order — literally every numbered section in this doc, once you adopt it) becomes a numbered ADR: `Context → Decision → Consequences → Alternatives considered → Status (proposed/accepted/superseded)`.
- **`scripts/check-adr-coverage.sh` runs in CI on every PR that touches `platform/` or changes a folder structure** — if the diff looks structural (new top-level folder, new port pattern, new engine action type) and no ADR is linked in the PR description, the PR fails. This forces "why" to be written down at the moment of decision, not reconstructed later.
- When ANY agent (human or AI) proposes a rework, **step one is reading `platform/adr/` — not proposing from scratch.** If the new proposal contradicts an existing accepted ADR, it must explicitly supersede it (`0002-rules-engine-boundary.md` → status changed to `superseded by 0014`, with a stated reason) — silent contradiction is what "AI forgets and breaks stuff" actually looks like in practice, and ADRs are the fix.

### B. The 3-agent loop — exactly as you specified, made concrete

**Shared memory, read fresh by all three agents, on every single run, no exceptions:** `platform/adr/` (the decision log) + this architecture doc. No agent is ever allowed to act from "what I remember from earlier in this conversation" — every agent re-reads the source files at the start of every run, because that is the only memory that is actually reliable across sessions.

```
 SHARED MEMORY — re-read fresh by every agent, every single run:
 platform/adr/*.md   +   this architecture doc
        |                    |                     |
        | read                | read                 | read
        v                    v                     v
 +--------------+     +----------------+     +----------------+
 |   AGENT 1    |     |    AGENT 2     |     |    AGENT 3     |
 |  GENERATOR   |     |   REVIEWER /   |     | CROSS-CHECKER  |
 |              |     |  RULE-ENFORCER |     |                |
 +------+-------+     +--------+-------+     +--------+-------+
        | code proposal          |                       |
        | + cited ADR(s)         |                       |
        +----------------------->|                       |
                                 | clean pass             |
                                 +---------------------- >|
        ^                       |                       |
        | fail list             |                       |
        | (loop back)           |                       |
        +-----------------------+                       |
        |                                                 |
        | loop back: contradicts an accepted ADR --------+
        | requires an explicit supersession proposal,
        | never a silent fix
        v
 +---------------------------------------------------------------+
 | only after BOTH Agent 2 and Agent 3 pass clean:                |
 | PR opened -> CI gates (Section 8) -> human review -> merge      |
 +---------------------------------------------------------------+
```

**Agent 1 — Generator**
- Writes/edits the actual code for the requested feature or change.
- **Must cite which ADR(s) and doc section(s) it followed**, in the PR description or commit message — no citation, no proceeding. This gives Agent 2 and Agent 3 something concrete to check against instead of re-deriving intent from a diff alone.
- Never marks its own output "done." Its output is always a proposal, never a merge-ready artifact by its own judgment.

**Agent 2 — Reviewer / Rule-enforcer**
- Runs the deterministic checks first — these are the same CI linters from §8, run early, not reinvented as fuzzy LLM judgment: `validate-naming.sh`, `errcheck`/`staticcheck`, ESLint `no-explicit-any`, the `!!` grep gate, the tracing span-naming convention (§4), the type-safety rules (§3).
- Then an LLM pass for what linters structurally can't catch: does this respect vertical-slice boundaries (§1–2)? Does it leak a concrete example noun instead of a real domain name (§0)? Does business logic stay inside the rules-engine registry instead of sneaking out as an `if`-chain (§4 rules-engine section)?
- **Loops back to Agent 1 with a specific, itemized failure list** — never "this looks wrong," always "line X violates the §3 null-check rule," "line Y's span name doesn't match `<layer>.<feature>.<action>`." This loop repeats until clean. Quality doesn't depend on Agent 1 getting it right on the first attempt — it won't, reliably — the loop is the actual mechanism, not a fallback.

**Agent 3 — Cross-checker**
- Two distinct jobs, kept separate, never merged into one pass:
  1. **External validity** — web-search: is this pattern/library/version still current best practice? Any known CVE in a newly introduced dependency? Has the recommended approach shifted since the ADR that originally justified it was written?
  2. **Internal consistency** — does this change contradict a decision already recorded in `platform/adr/`? If yes: **stop.** This is never silently patched or auto-resolved. Agent 3 produces an explicit **ADR supersession proposal** (e.g. `0002-rules-engine-boundary.md` status → `superseded by 0014`, with the stated reason) that a human must approve before the code proceeds — a past decision never gets silently overridden by an agent that "forgot" why it was made.
- Only after Agent 2's rule pass AND Agent 3's cross-check both come back clean does a PR get opened for CI (§8) and human review — no agent output reaches a human as "ready" before both checks pass.

**Why this is the actual answer to "AI doesn't remember":** none of the three agents' conversation history or context window is ever trusted as memory. The ADR store is the memory. Every agent consults it fresh, every run — so a rework six months from now starts by reading `platform/adr/`, not by re-deriving the architecture from whatever an AI happens to recall (nothing, reliably, across sessions) or whatever a human happens to recall (which decays too).

This closes the loop you asked for: generate → enforce rules → verify externally + verify against prior decisions → record the outcome → only then does a human see a PR. Rework six months from now starts by reading `platform/adr/`, not by re-deriving the architecture from memory (yours or the AI's).

---

## 11. Frontend — zero logic in the UI, brutally enforced

"UI has some logic in it" is how every frontend eventually becomes untestable. The rule is absolute, not aspirational:

### The law

**A component (`.tsx`) is allowed to contain exactly three things: markup, style bindings, and calls to hooks/props that were computed elsewhere.** Nothing else. If a `.tsx` file contains a conditional that decides a business outcome (is this order eligible, is this price correct, is this field required), that conditional is a bug, not a feature, regardless of how small it looks.

### What is explicitly banned inside `page.tsx` / `*.component.tsx` / any React component

- **No business conditionals.** `if (order.total > threshold)` inside JSX or a component body is banned — that decision belongs to the rules engine (`lib/rules/evaluator.ts`) or a pure function in `lib/transforms/`, called from `actions.ts`/a hook, with the component only rendering the already-decided result.
- **No data transformation.** `.map`/`.filter`/`.reduce` on raw API data INSIDE a component is banned — the component receives already-shaped view-model data. Raw → view-model transformation lives in `lib/transforms/<feature>.viewmodel.ts`, tested independently of any rendering.
- **No validation logic.** Validation is `schema.ts` (zod) + `lib/rules/evaluator.ts`, never a hand-written `if (!email.includes('@'))` inside a form component.
- **No direct data fetching inside a component body.** All fetching goes through `lib/data/<feature>.ts` — a component calls a hook that wraps that, never `fetch()`/`axios` directly.
- **No cross-feature imports.** A component in `(features)/<feature-a>/components/` never imports from `(features)/<feature-b>/components/` — shared UI is promoted to `components/ui/` (dumb, generic, zero business awareness) the moment two features need it.
- **No inline magic values.** Thresholds, status strings, enum-like literals — all sourced from `lib/config` or generated contract types, never typed as a raw string/number inside a component.

### CSS/styling — separated, not just "in a different file"

- **Styling logic (conditional classes, computed styles, responsive breakpoints) lives in a dedicated style-resolver, never inline `style={{}}` with a ternary, and never a component-body `if` that toggles a class name.**
  - Pattern: `lib/styles/<feature>.styles.ts` exports a pure function `resolve<Feature>Classes(state: <Feature>ViewState): ClassNames` — the component calls it, the component never computes class logic itself.
  - Use `cva` (class-variance-authority) or an equivalent variant-driven styling tool for anything with more than 2 visual states — variant tables are data, not `if/else` chains, which is the same "rules as data" principle applied to CSS.
  - Design tokens (colors, spacing, typography scale) are centralized in one token file/theme config — a hardcoded hex value or magic pixel number inside a component is a lint-blocking violation, exactly like a hardcoded business threshold.
- **No CSS-in-JS with embedded business logic.** Styled-components/emotion templates that branch on business state (not just visual state) are banned — a style must only ever answer "how does this look," never "should this be shown."
- **Component structure: container vs presentational, strictly.** A `*.container.tsx` (or the `page.tsx`/`actions.ts` combo) computes the view-state; the presentational component underneath receives fully-resolved props and ONLY renders — this split is what actually makes "no logic in UI" enforceable in code review instead of a vague guideline.

### CI enforcement (not optional, matches §8's philosophy exactly)

- ESLint custom rule: flag any `if`/ternary/`&&`-render-guard inside JSX that references more than a single boolean prop (a simple `{isLoading && <Spinner/>}` is fine — a multi-condition business check is not).
- ESLint custom rule: ban `fetch`/`axios` imports inside `(features)/*/components/` and `(features)/*/page.tsx` — only `lib/data/*` may import them.
- ESLint custom rule: ban inline hex colors / raw px values outside the token file.
- A component exceeding ~80–100 lines is a signal it's doing more than rendering — CI warns (doesn't hard-fail, but Agent 2 from §10 treats it as a required justification).

---

## 12. Database layer — strict compatibility, migration, multi-tenancy, sharding, replica rules for real scale

This is the layer where "we'll fix it later" turns into a multi-week incident. Nothing here is optional past a certain scale, and pretending otherwise is how systems die during their first real growth spurt.

### Schema compatibility & migration — non-negotiable sequence

- **Every migration is expand → migrate → contract, across THREE separate deploys, never one.**
  1. **Expand:** add the new column/table/index as nullable/optional, deploy. Old code and new code both work against this schema.
  2. **Migrate:** backfill data, deploy code that writes to both old and new shape (dual-write) if needed, verify via a reconciliation job (see §13) that old and new agree.
  3. **Contract:** remove the old column/table only after 100% of traffic and all replicas confirm the new shape is exclusively in use — and only after a defined bake period (measured in days, not deploys).
- **A migration that adds a NOT NULL column without a default, or renames a column in place, or drops a column in the same deploy that stops writing to it, is REJECTED at CI — full stop, no exceptions, no "just this once."**
- **Migrations are forward-only and additive by default.** A destructive migration (drop column/table, narrow a type) requires a linked ADR (§10) explicitly justifying it, plus a verified rollback plan tested in staging before it's allowed near production.
- **Every migration file is idempotent and re-runnable.** `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS` (or your migration tool's equivalent guard) — a migration that fails halfway and gets re-run must not error or corrupt state.
- **Schema versioning is tracked per-service, and the running schema version is embedded in every trace span** (`db.schema.version`), exactly like `config.version` and `rules.version` — a data anomaly must always be traceable to an exact schema generation.
- **Backward compatibility window is a config value, not a guess** (`platform/config/base.yaml: db.compat.minSupportedSchemaVersion`) — CI fails a deploy that would break a service still running against a schema version outside that window.

### Multi-tenancy — pick ONE strategy per data class, document it in an ADR, never mix silently

| Strategy | When | Isolation | Cost |
|---|---|---|---|
| **Shared schema, `tenant_id` column on every row** | Most tenants, low-to-medium data volume per tenant, cost-sensitive | Row-level, enforced by Row-Level Security (RLS) at the DB engine, NEVER by application-layer `WHERE tenant_id = ?` alone | Lowest infra cost, highest blast-radius risk if RLS is misconfigured |
| **Schema-per-tenant** | Medium tenant count, need stronger isolation, tenants may need custom schema extensions | Strong (DB-enforced schema boundary) | Migration tooling must run N times per deploy — migration pipeline (above) must be tenant-aware |
| **Database-per-tenant** | High-value/regulated tenants, strict data-residency or compliance requirements | Strongest, physical isolation | Highest operational cost — connection pooling, migration orchestration, and backup/restore all multiply per tenant |

**Brutal rules, regardless of strategy chosen:**
- **`tenant_id` (or the tenant-scoping mechanism) is NEVER optional on a query.** Every repository method takes a tenant context as a mandatory first-class parameter, not an optional filter bolted on — a query that can accidentally omit tenant scoping is a data-leak vulnerability, not a bug.
- **Row-Level Security (RLS) is enforced at the database engine for the shared-schema strategy — application-layer filtering ALONE is explicitly forbidden** because a single missed `WHERE` clause in one code path becomes a cross-tenant data leak, and code review will eventually miss it.
- **Tenant context propagates through the exact same mechanism as trace context (§4 of the earlier doc) — ambient, not manually threaded per query.**
- **No tenant ever shares a connection pool credential with elevated/admin privileges** — the runtime DB user for tenant-scoped queries has RLS-enforced, least-privilege grants only.

### Sharding — rules, not vibes

- **Shard key is chosen from access patterns, not convenience** — it must be present on ≥90% of queries in the hot path, or you've built a system that cross-shard-scatters most of its traffic, defeating the point of sharding.
- **Shard key is immutable once assigned to a row.** If a shard key needs to change (e.g., a tenant moves plans), that's a **data migration operation**, explicitly modeled (with its own tracing, its own reconciliation check — §13), never an in-place update.
- **Cross-shard queries/joins are either eliminated by design (denormalize, precompute) or explicitly modeled as a scatter-gather with a documented latency/consistency cost** — an ORM that silently fans out a query across all shards without anyone noticing is an incident waiting to happen, not a convenience.
- **Resharding is a planned, tooled operation with a dry-run mode and reconciliation verification (§13) before cutover — never a manual one-off script run against production.**
- **Every shard's schema version, migration state, and health is visible in one place** — shard drift (shard 4 is 2 migrations behind shard 7) is a page-worthy alert, not something discovered during an incident.

### Replicas — read/write discipline

- **Writes always go to the primary. Reads default to a replica UNLESS the caller explicitly requires read-your-writes consistency** — and that requirement is an explicit, typed parameter on the repository call (`ReadConsistency.STRONG` vs `ReadConsistency.EVENTUAL`), never an implicit assumption.
- **Replica lag is measured and exposed as a first-class metric, correlated with trace_id** — if a request reads stale data because of replica lag, that must be diagnosable from the trace, not guessed at.
- **A write-then-immediate-read within the same logical operation (the classic "I created it and then couldn't find it" bug) is handled by routing that specific read to the primary, driven by the Idempotency-Key/Operation-ID (§14) — not by adding an arbitrary `sleep()` before reading, ever.**
- **Failover is tested, not assumed.** A replica promotion runbook that has never actually been executed in staging is a runbook that doesn't work — this is a recurring, scheduled game-day exercise, not a document that sits unread.

### High-scale non-negotiables

- **Connection pooling is centralized (`platform/adapters/<store>/base`, per §9's master list) with explicit, per-service, per-environment pool-size limits sourced from config — an unbounded or per-feature-configured pool is a production-outage generator under load.**
- **Every query has a statement timeout, enforced at the driver/pool level, not just "the client will eventually give up."** A query with no timeout is a resource leak waiting for a bad day.
- **N+1 queries are a CI-blocking finding**, not a code-review nice-to-have — query-count assertions belong in the same integration tests from §7 (assert "this operation issues ≤ N queries," fail the build if it regresses).
- **Every table that will be queried at scale has its access pattern documented alongside its index list in the same migration/schema file** — an index added without a documented query it serves is dead weight; a query pattern without a supporting index is a future incident.

---

## 13. Contracts + validation at every layer — because you will get data mismatch and duplication otherwise, guaranteed

You are correct to be paranoid here: an end-to-end system with async messaging, retries, and multiple layers WILL produce duplicate writes and mismatched data if you don't design against it explicitly. This isn't a "nice to have," it's the difference between a system that's trustworthy and one that silently corrupts state under load.

### Validation happens at EVERY layer, independently — never trust that an upstream layer already checked

| Layer | What it validates | Why it can't skip this even though a lower layer "already did" |
|---|---|---|
| **Frontend (`schema.ts`, zod)** | Shape, type, format, required fields, client-visible business rules (via `lib/rules/evaluator.ts`) | Fast UX feedback — but this is NEVER trusted as the source of truth; a malicious or buggy client can bypass it entirely |
| **API/request layer (boundary validators, §3)** | Same shape/type/format checks server-side, PLUS authorization, PLUS rate/quota checks, PLUS request-level invariants (Idempotency-Key present and well-formed, Tenant-ID matches auth context) | The frontend check can be bypassed (curl, a compromised client, a different consumer entirely) — server-side re-validation is mandatory, not redundant |
| **Domain/logic layer** | Business invariants that make an entity valid (can't be expressed as a simple schema rule — e.g., cross-field consistency, state-transition legality) | A request can be individually well-formed but still violate a domain invariant that only makes sense with full entity context |
| **Database layer** | Constraints (`NOT NULL`, `CHECK`, foreign keys, `UNIQUE`), Row-Level Security, and — critically — **the actual concurrency-safe uniqueness/idempotency guarantee** (below) | Application-level checks race under concurrency; only the database can atomically guarantee "this exact operation happened exactly once" |

**Rule: each layer validates independently and NONE of them may skip a check because "the layer before me already did it."** Redundancy here is the point, not waste — it's what makes end-to-end integrity actually hold instead of being an assumption.

### Preventing duplicate writes / double-processing — the actual mechanism, not a hope

1. **Every mutating operation requires an `Idempotency-Key` from the caller (see §14 for the full identifier taxonomy).** The API layer looks it up in an idempotency store (a dedicated table/cache, keyed by `(tenant_id, idempotency_key)`) BEFORE executing any business logic:
   - Key seen before + operation completed → return the cached prior result, execute nothing.
   - Key seen before + operation still in-flight (concurrent retry) → return a `409`/in-progress signal, execute nothing.
   - Key not seen → proceed, and atomically record the key as "in-flight" as part of the SAME database transaction that performs the write (not a separate call that can race).
2. **The idempotency guarantee is enforced at the database with a UNIQUE constraint on `(tenant_id, idempotency_key)`**, not just an application-level in-memory check — a distributed system WILL have concurrent duplicate requests hit different instances simultaneously, and only a DB-level unique constraint is race-proof.
3. **The idempotency record stores a hash of the request payload alongside the key.** If the same key arrives with a DIFFERENT payload, that's a client bug or an attack — reject it explicitly (`422 Idempotency-Key payload mismatch`), never silently process the new payload under the old key.
4. **Idempotency keys expire on a defined TTL** (config-driven, §6) — long enough to cover realistic retry windows (network partition, client backoff), short enough not to grow the idempotency store unboundedly.
5. **For event-driven/async paths (message consumers), the SAME principle applies via a processed-events ledger:** every consumer checks `(tenant_id, event_id)` against a processed-events table inside the same transaction as the side effect it performs — "at-least-once delivery, exactly-once processing" is achieved here, not by hoping the broker doesn't redeliver.

### Preventing data mismatch across layers/services

- **A single write path per piece of data.** If both a Kafka consumer and a direct API call can write to the same row, that's a designed race condition — pick one writer per data element, and if two paths genuinely need to write, they go through the SAME internal function/port, never two independently-implemented write paths.
- **Outbox pattern (already specified in §6 of v1 / the messaging section) is the mechanism that keeps "DB write" and "event published" from ever diverging** — the event is written in the same transaction as the state change, and a relay publishes it asynchronously; there is no code path where the DB commits but the event is lost, or vice versa.
- **Reconciliation jobs are a scheduled, first-class citizen, not an afterthought.** A periodic (config-driven interval) job compares source-of-truth state against derived/projected/cached state (read models, search indices, cross-service copies) and emits a metric + alert on ANY divergence — silent drift between a primary store and a projection is exactly the "data mismatch" failure mode you're worried about, and it is only caught if something is actively looking for it.
- **Every cross-service data copy (a denormalized field, a cache, a read-model) carries the `Resource-Version`/`ETag` of its source (§14)** — a consumer of that copy can always tell "is this the latest version or am I looking at something stale," instead of silently trusting a copy that might be behind.
- **Optimistic concurrency control (`ETag`/`If-Match`, §14) is mandatory on every update to a resource that can be concurrently modified.** A blind "read, modify in memory, write back" without a version check is a guaranteed lost-update bug under any real concurrency — CI/Agent 2 (§10) rejects any update path that doesn't carry a version check.

---

## 14. The full identifier taxonomy — every request carries all of these, and each one has ONE enforced meaning

This is the part most systems get wrong by either (a) having none of these, or (b) having 3 of them that all secretly mean the same thing because nobody defined the boundaries. Brutal, exact definitions, one per concept, and — critically — **which layer generates it, which layer consumes it, and what breaks if it's missing.**

| Identifier | Generated by | Meaning (one sentence, no overlap with any other row) | Propagation | If missing / duplicated |
|---|---|---|---|---|
| **Request-ID** | Edge/gateway or the immediate caller, per HTTP call | Identifies exactly this one HTTP request/response pair | New value on every single call, including retries — a retry of the same logical operation gets a NEW Request-ID | Logs for this specific call can't be isolated from others; low severity but debugging gets harder |
| **Trace-ID** | First service in the call chain (Next.js middleware) | Identifies the entire distributed execution across all services for one end-to-end user action | Propagated unchanged (W3C `traceparent`) through every downstream call, per §4's tracing section | End-to-end tracing (§4) is impossible — this is the backbone of everything in that section |
| **Span-ID** | Each service, for each unit of work | Identifies one specific operation/function-call span within the trace | Never propagated outward as-is — each hop generates a new span-id as a child of the one it received | Trace waterfall (§4) loses granularity — you know the trace happened but not which step was slow |
| **Correlation-ID** | The originating business workflow (e.g., a saga/multi-step process orchestrator) | Identifies a multi-request business workflow that spans MULTIPLE trace-ids (a checkout that spans several separate user actions over minutes) | Persisted with the workflow/saga state, attached to every request/event that's part of that workflow | Can't reconstruct "everything that happened as part of this one business process" across separate technical traces |
| **Operation-ID** | The client or the API layer, per logical business operation | Identifies WHAT is being done — maps to a specific contract-defined operation (`createOrder`, `cancelOrder`), independent of how many times it's retried | Fixed for the logical operation, distinct from Request-ID (which changes per retry) | Rule-engine/tracing spans (§4) can't be grouped by "which business operation was this," only by raw HTTP call |
| **Idempotency-Key** | The client, per logical mutating operation the client intends to happen exactly once | Enables safe retry/dedup per §13 — same key across retries of the SAME intended operation | Same value across all retries of one client-intended operation; NEW value for a genuinely new operation | §13's entire duplicate-prevention mechanism doesn't function — every retry becomes a real duplicate write |
| **Causation-ID** | Whatever event/request directly triggered this one | Points to the ONE immediate predecessor that caused this request/event to exist (an event's causation-id is the command that emitted it) | Set once at creation, never changes, forms a causal chain when followed backward | Root-cause analysis in an event-driven system degrades to "we know it happened, not why" |
| **Parent-Request-ID** | The immediate upstream caller, when it makes a downstream call | Points to the specific parent HTTP request (distinct from Causation-ID, which can be an event, not just a request) | Set per hop, forms a call-tree (this is effectively what Span-ID's parent relationship already encodes inside a trace — Parent-Request-ID is for cases where the parent lives in a SEPARATE trace, e.g. an async job picking up work queued by an earlier request) | Cross-trace call attribution is lost — you can see the child request happened but not which specific earlier request queued it |
| **Actor-ID** | Auth/identity layer, resolved from the caller's credentials | WHO (human user or service account) is responsible for this action, for audit purposes | Attached at the API boundary, flows through unchanged, written into every audit log entry | Audit trail can't answer "who did this" — a compliance and security gap, not just a debugging one |
| **Client-ID** | Auth/identity layer, resolved from the calling application's credentials | WHICH APPLICATION/integration is calling (distinct from Actor-ID — a client-id is the app, an actor-id is the human/service behind it) | Same as Actor-ID | Can't distinguish "our own frontend called this" from "a third-party integration called this" — breaks per-client rate limiting and analytics |
| **Tenant-ID** | Auth/identity layer, resolved from the caller's tenant context | WHICH TENANT owns this operation and its data — mandatory per §12's multi-tenancy rules | Ambient, propagated identically to trace context, enforced by RLS at the DB | Catastrophic — this is the exact mechanism that prevents cross-tenant data leaks; missing Tenant-ID on a query is a security incident, not a bug |
| **Session-ID** | Frontend/auth layer, per user login session | WHICH user session/browser context this request belongs to (UX/analytics/security concern, distinct from Actor-ID which persists across sessions) | Cookie/token-scoped, expires with the session | Session-scoped rate limiting, "log out all other sessions," and session-replay debugging break |
| **Operation-Version** | The client, declared per call (or defaulted by the API layer) | WHICH VERSION of a specific operation's business semantics is being invoked (distinct from API-Version — an API can add a new operation version without bumping the whole API) | Fixed per call, validated against what the server currently supports | Server can't safely evolve one operation's behavior without either breaking old clients or guessing what they expect |
| **API-Version** | The client, declared per call (URL path, header, or media-type) | WHICH VERSION of the overall API contract is being used | Fixed per call | Breaking-change rollout (§8/§6 versioning discipline) has no mechanism — every change becomes a breaking change for everyone simultaneously |
| **Resource-ID** | Whoever creates the resource (server-generated, never client-guessed) | WHICH specific resource/entity is being read or mutated | Stable for the resource's lifetime | Can't address a specific entity — this one is obviously fatal if missing, included here only for taxonomy completeness |
| **Resource-Version** | The database, incremented on every mutation | WHICH VERSION of that specific resource's state this is | Returned on every read, required on every write (via ETag/If-Match below) | §13's optimistic-concurrency guarantee doesn't exist — lost-update bugs under any concurrent access |
| **ETag / If-Match** | Server generates ETag on read; client sends If-Match on write | Standard HTTP mechanism carrying Resource-Version for optimistic concurrency control | Per-request, tied to Resource-Version | Same failure as missing Resource-Version — concurrent writers silently clobber each other |
| **Deadline** | The client or an upstream service, per call | WHEN this operation must stop being processed (absolute timestamp or remaining budget), propagated so a downstream service doesn't keep working on something the caller already gave up on | Decrements/propagates through the call chain (context deadline in Go, coroutine timeout in Kotlin, `AbortSignal` in TS) | Wasted work on requests nobody's waiting for anymore; resource exhaustion under load |
| **Priority** | The client or a business-rule decision (via the rules engine, §4 of the rules-engine section) | HOW urgently this should be scheduled relative to other work, for queueing/backpressure decisions | Read by queue/worker infrastructure, not by business logic directly | Can't implement meaningful load-shedding — everything gets treated as equally urgent until the system falls over |
| **Retry-Count** | Incremented by whatever layer performs the retry (client, gateway, or message consumer) | HOW MANY TIMES this exact operation has already been attempted | Incremented per retry, checked against a max-retry config (§6) | Runaway retry storms with no circuit-breaking signal to act on |
| **Source** | Whatever system originates the request (a specific integration, a specific internal service, a specific batch job) | WHERE this request/event technically originated, for routing and debugging (distinct from Actor-ID, which is WHO is responsible) | Set at origin, unchanged downstream | Can't distinguish "this came from our batch reconciliation job" from "this came from a live user request" when debugging an anomaly |
| **Environment** | Deployment/infra layer | WHICH environment (dev/staging/prod) generated this — critical when trace/log backends are shared across environments | Set by the deployment, embedded in every span/log | Cross-environment data/log contamination in a shared observability backend — a dev trace gets mistaken for a prod incident |
| **Security Context** (Authentication, Authorization, Scopes/Permissions, Security classification) | Auth/identity layer, resolved once at the boundary | WHETHER this request is allowed to do what it's asking, and what data classification applies to what it touches | Resolved once at the API boundary, never re-derived deeper in the stack (deeper layers trust the resolved context, they don't re-authenticate) | The most severe failure category on this entire list — a missing or wrongly-propagated security context is a direct authorization bypass, not a debugging inconvenience |

### The brutal enforcement rules for this taxonomy

1. **Every one of these has an EXACT, non-overlapping definition, and mixing two of them into one field (e.g., using Request-ID as if it were Idempotency-Key) is a CI-blocking review rejection, not a style nitpick** — the entire point of this table is that "just use one ID for everything" is exactly the failure mode that causes untraceable data mismatches.
2. **Identifiers are generated ONCE, at the correct layer (column 2 above), and never regenerated or overwritten downstream** — a service that receives a Trace-ID and generates a new one instead of propagating it has broken end-to-end tracing (§4) silently, and this is the single most common real-world implementation mistake.
3. **Propagation is automatic via ambient context (same mechanism as §4's tracing), never manually threaded as an extra function parameter per call** — if a dev has to remember to pass `tenantId` as the 7th argument to every function, it WILL eventually be forgotten, and that's a security incident (missing Tenant-ID) or a data-integrity incident (missing Idempotency-Key) waiting to happen.
4. **The `platform/http` client (§9's master list) automatically attaches every applicable identifier as headers on every outbound call** — this is centralized exactly once, matching the "everything centralized" philosophy, not re-implemented per feature.
5. **Every log line, every trace span, and every database audit row carries the FULL set of applicable identifiers, not a subset** — an incident where you have the Trace-ID but not the Tenant-ID or Actor-ID is an incident you can see but not fully explain, and "fully explain" is the actual bar.
6. **Contract schemas (`platform/contracts/`) formally declare which identifiers are required vs optional per operation** — this is validated at ALL THREE layers from §13 (frontend schema, API boundary validator, and a CI contract-test), not left to convention.
