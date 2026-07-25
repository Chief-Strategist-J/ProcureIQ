MICRO FRONTEND ARCHITECTURE
═══════════════════════════════════════════════════════════════

NON-NEGOTIABLE AXIOMS (micro frontend specific)
──────────────────────────────────────────────────────────────
  MF-1  each micro frontend is deployed and versioned independently
  MF-2  micro frontends NEVER import each other's source directly
  MF-3  micro frontends communicate ONLY via custom events or a shared event bus
  MF-4  each micro frontend owns its own state — no shared global store
  MF-5  each micro frontend has its own build pipeline and its own CI/CD
  MF-6  shared UI primitives (design system) live in a separate published package
  MF-7  the shell app is a router only — zero business logic, zero domain state
  MF-8  each micro frontend is renderable in complete isolation (storybook, test)
  MF-9  each micro frontend defines its public contract (routes, events, props)
  MF-10 no micro frontend hardcodes the URL of another micro frontend


DECISION TREE — which micro frontend strategy?
═══════════════════════════════════════════════════════════════

Do your teams deploy independently?
│
├─ YES and need runtime composition (load at runtime, not build time)?
│  └─ Module Federation (Webpack / Rspack / Vite)
│     └─ host app loads remote bundles at runtime
│
├─ YES and prefer iframe-level isolation?
│  └─ iframes with postMessage contract
│     └─ strongest isolation, slowest UX
│
├─ YES and each MFE is a full page / route?
│  └─ Route-based composition
│     └─ shell routes to separate deployed apps per route
│
├─ YES and need component-level embedding?
│  └─ Web Components (custom elements)
│     └─ framework-agnostic, works anywhere in DOM
│
└─ NO — one team, one repo?
   └─ monorepo with shared packages is enough
      └─ you do NOT need micro frontends


PROJECT ROOT — MICRO FRONTEND
═══════════════════════════════════════════════════════════════

project/
├── shell/                         ← router only, mounts MFEs, zero domain logic
│   ├── src/
│   │   ├── router/                ← maps routes to MFE remote URLs
│   │   ├── layout/                ← shared chrome: nav, footer, error boundary
│   │   ├── auth/                  ← token storage and injection into MFE props
│   │   └── event-bus/             ← typed global event bus (pub/sub only)
│   ├── contracts/
│   │   └── mfe-registry.yaml      ← all MFEs: name, remote URL, exposed routes
│   ├── scripts/ (full standard set)
│   ├── deploy/docker/ + kubernetes/ + terraform/
│   └── .github/workflows/ci + cd-staging + cd-production
│
├── design-system/                 ← published npm package, no business logic
│   ├── src/
│   │   ├── tokens/                ← colors, spacing, typography (CSS vars)
│   │   ├── components/            ← Button, Input, Modal, Table, etc.
│   │   └── icons/
│   ├── .storybook/
│   └── scripts/
│
├── mfe-auth/                      ← login, register, password reset
│   ├── contracts/
│   │   └── mfe-contract.yaml      ← exposed routes, emitted events, accepted props
│   ├── src/
│   │   ├── api/                   ← calls auth backend package via generated client
│   │   ├── features/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── reset-password/
│   │   └── event-bus/             ← local bridge to shell event bus
│   ├── bootstrap/                 ← module federation entry point
│   ├── scripts/ (full standard set)
│   └── deploy/ + .github/workflows/
│
├── mfe-dashboard/
│   └── (same structure)
│
├── mfe-payments/
│   └── (same structure)
│
├── mfe-settings/
│   └── (same structure)
│
└── shared/
    ├── contracts/
    │   └── mfe-events/            ← all cross-MFE event schemas
    │       ├── user.logged-in.ts
    │       ├── cart.updated.ts
    │       └── registry.ts
    └── types/                     ← shared TS types only (no components)


EACH MICRO FRONTEND — INTERNAL STRUCTURE
═══════════════════════════════════════════════════════════════

mfe-{name}/
├── contracts/
│   └── mfe-contract.yaml          ← WRITTEN FIRST, defines:
│                                     - exposed module federation remotes
│                                     - routes this MFE owns
│                                     - events this MFE emits
│                                     - events this MFE listens to
│                                     - props the shell passes in
│
├── src/
│   ├── bootstrap.{ext}            ← module federation entry, mounts app
│   ├── api/                       ← generated HTTP clients from backend contracts
│   │   └── {backend-service}/v1/  ← never hand-written
│   ├── features/
│   │   └── {feature}/
│   │       ├── index.{ext}        ← ONLY public surface
│   │       ├── page.{ext}         ← route-level component
│   │       ├── components/        ← feature-local components only
│   │       ├── hooks/             ← feature-local hooks
│   │       ├── store.{ext}        ← feature-local state (zustand / jotai)
│   │       └── tests/
│   │           ├── unit/
│   │           ├── integration/
│   │           └── visual/        ← storybook stories + visual regression
│   ├── shared/                    ← MFE-internal shared only
│   │   ├── components/            ← imports from design-system, never other MFEs
│   │   ├── hooks/
│   │   └── utils/
│   └── event-bus/
│       ├── emitter.{ext}          ← typed wrappers around shell event bus emit
│       └── listeners.{ext}        ← typed wrappers around shell event bus on
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── contract/                  ← validates mfe-contract.yaml is implemented
│   ├── e2e/                       ← playwright in isolation (no other MFE running)
│   └── visual/                    ← chromatic / Percy visual snapshots
│
├── scripts/                       ← full standard set
│   ├── setup.sh
│   ├── run.sh                     ← dev server + module federation
│   ├── run-standalone.sh          ← run WITHOUT shell (fully isolated)
│   ├── build.sh
│   ├── test.sh
│   ├── test-unit.sh
│   ├── test-integration.sh
│   ├── test-contract.sh
│   ├── test-e2e.sh
│   ├── test-visual.sh
│   ├── scan.sh
│   ├── generate.sh                ← regenerate API clients from backend contracts
│   ├── health-check.sh
│   ├── smoke-test.sh
│   ├── deploy-docker.sh
│   ├── deploy-k8s.sh
│   ├── deploy-cdn.sh              ← deploy bundle to CDN (S3 + CloudFront etc)
│   ├── rollback-deploy.sh
│   └── storybook.sh               ← run storybook for this MFE only
│
├── deploy/
│   ├── docker/
│   ├── kubernetes/
│   └── cdn/
│       ├── s3-sync.sh
│       └── invalidate-cache.sh
│
├── module.federation.config.{ext}  ← exposes and remotes declaration
├── .github/workflows/
│   ├── ci.yaml
│   ├── cd-staging.yaml
│   └── cd-production.yaml
├── .env.example
└── mfe-contract.yaml              ← symlink to contracts/mfe-contract.yaml


MFE CONTRACT FILE FORMAT
═══════════════════════════════════════════════════════════════

# contracts/mfe-contract.yaml
name: mfe-payments
version: "2.1.0"
remote-url:
  dev:     http://localhost:3003/remoteEntry.js
  staging: https://cdn.staging.example.com/mfe-payments/2.1.0/remoteEntry.js
  prod:    https://cdn.example.com/mfe-payments/2.1.0/remoteEntry.js

routes:
  - /payments
  - /payments/:id
  - /checkout

exposed-modules:
  - ./PaymentsApp        ← full routed app
  - ./CheckoutWidget     ← embeddable component

emits-events:
  - name: payment.completed
    schema: shared/contracts/mfe-events/payment.completed.ts
  - name: payment.failed
    schema: shared/contracts/mfe-events/payment.failed.ts

listens-to-events:
  - name: cart.updated
    schema: shared/contracts/mfe-events/cart.updated.ts
  - name: user.logged-in
    schema: shared/contracts/mfe-events/user.logged-in.ts

accepts-props:
  - name: authToken
    type: string
    required: true
  - name: userId
    type: string
    required: true
  - name: theme
    type: light | dark
    required: false
    default: light

shell-dependency-version: ">=1.4.0"


COMMUNICATION RULES (cross-MFE)
═══════════════════════════════════════════════════════════════

MFE A needs to tell MFE B something?
│
├─ Is it a ONE-WAY notification (fire and forget)?
│  └─ emit typed event via shell event bus        ✓
│     └─ B subscribes to event by name
│        └─ both sides use schema from shared/contracts/mfe-events/
│
├─ Is it SHARED STATE that multiple MFEs read?
│  └─ does it belong to one owner?
│     ├─ YES → owning MFE holds state, emits update events
│     └─ NO  → put in shell only (auth token, user id, theme)
│
├─ Is it a DIRECT CALL / REQUEST-RESPONSE?
│  └─ STOP — direct MFE-to-MFE calls are FORBIDDEN
│     └─ both MFEs call the backend independently
│        each calls its own backend API
│
├─ Is it SHARED URL STATE (e.g. selected item id)?
│  └─ use URL params / query string
│     └─ shell router mediates, no MFE-to-MFE coupling
│
└─ Is it SHARED UI STATE (modal open, drawer, toast)?
   └─ shell owns global UI state
      └─ MFEs emit events, shell reacts and renders


SHELL RULES
═══════════════════════════════════════════════════════════════

SHELL ALLOWED                       SHELL FORBIDDEN
──────────────────────────────      ──────────────────────────────────
route to correct MFE        ✓       business logic                 ✗
render shared chrome        ✓       domain state                   ✗
pass auth token as prop     ✓       MFE-specific state             ✗
manage global event bus     ✓       API calls (except auth check)  ✗
handle auth redirect        ✓       direct MFE source import       ✗
render error boundaries     ✓       coupling two MFEs together     ✗
manage global UI state      ✓       feature flags per MFE          ✗
(modals, toasts, theme)
load MFE remote bundles     ✓
handle MFE load failures    ✓


DESIGN SYSTEM RULES
═══════════════════════════════════════════════════════════════

  DS-1  design system is a published npm package with semantic versioning
  DS-2  MFEs declare design-system as a peer dependency with version range
  DS-3  design system contains ZERO business logic and ZERO API calls
  DS-4  every component has a storybook story — no undocumented components
  DS-5  design system uses CSS custom properties (vars) for all tokens
  DS-6  breaking changes to design system = major version bump
  DS-7  MFEs must not override design system CSS without a documented reason
  DS-8  shell and all MFEs share ONE instance of design system via module federation


VERSIONING AND DEPLOYMENT RULES
═══════════════════════════════════════════════════════════════

  V-1   each MFE has its own semantic version — versions are independent
  V-2   MFE bundle deployed to CDN at path: /{mfe-name}/{version}/remoteEntry.js
  V-3   shell mfe-registry.yaml pins the version of each MFE it loads
  V-4   updating an MFE version = update mfe-registry.yaml in shell PR
  V-5   old MFE version stays on CDN until all shells have updated
  V-6   shell and MFEs use the same module federation shared dependency list
        (React, React-DOM) — prevents duplicate framework instances
  V-7   every CDN deploy is immutable — bundles are never overwritten in place
  V-8   rollback = pin previous version in mfe-registry.yaml


LAYER CALL RULES INSIDE AN MFE
═══════════════════════════════════════════════════════════════

  page.{ext}         → features/*/index      ✓
  page.{ext}         → api/                  ✗  go through feature
  feature/index      → feature/store         ✓
  feature/index      → feature/hooks         ✓
  feature/*/hook     → api/ (generated)      ✓
  feature/*/hook     → event-bus/emitter     ✓
  feature/A/*        → feature/B/*           ✗  never cross-feature
  feature/A/*        → feature/B/index       ✓  only via index
  shared/components  → design-system         ✓
  shared/components  → feature/*             ✗  shared knows nothing of features
  api/               → feature/*             ✗  api layer is dumb client
  event-bus/*        → feature/*             ✗  event bus is infrastructure


CI / CD PER MFE (independent)
═══════════════════════════════════════════════════════════════

CI (every PR)
──────────────────────────────────────────────────────────────
  stage 1: STATIC ANALYSIS
    □ eslint --max-warnings 0
    □ tsc --strict (no any, no ts-ignore without justification)
    □ dependency audit (npm audit --audit-level=high)
    □ no import from other MFE source trees
    □ mfe-contract.yaml lint (validates schema + format)
    □ design-system version in allowed range

  stage 2: UNIT TESTS
    □ coverage >= 80%
    □ all API calls mocked
    □ all event bus calls mocked
    □ vitest, < 2 minutes

  stage 3: CONTRACT TESTS
    □ validate mfe-contract.yaml routes are all implemented
    □ validate all emitted events match their schema
    □ validate all accepted props are handled

  stage 4: INTEGRATION TESTS
    □ MFE mounted standalone (no shell)
    □ real API calls to backend staging
    □ event emission verified

  stage 5: VISUAL TESTS
    □ storybook builds without errors
    □ chromatic visual diff against baseline
    □ fail on unreviewed visual changes

  stage 6: E2E (isolated)
    □ playwright against standalone MFE
    □ no dependency on other MFEs running

  stage 7: BUILD
    □ production bundle built
    □ bundle size checked against budget
    □ bundle uploaded to CDN staging path

CD STAGING
──────────────────────────────────────────────────────────────
  1. CI must pass on same commit
  2. bundle deployed to CDN: /{mfe-name}/{version}/remoteEntry.js
  3. smoke-test.sh (load bundle, verify module exports exist)
  4. integration test against staging shell

CD PRODUCTION
──────────────────────────────────────────────────────────────
  trigger: git tag v* — manual only
  1. staging CD passed on same sha
  2. 2 approvals required
  3. deploy bundle to prod CDN path (immutable)
  4. open PR to update shell mfe-registry.yaml version pin
  5. shell PR triggers its own ci + cd pipeline
  6. rollback = revert mfe-registry.yaml PR in shell


BUNDLE SIZE BUDGET
═══════════════════════════════════════════════════════════════

  □ each MFE defines budget in package.json or bundler config
  □ initial JS: <= 150KB gzipped (excluding shared deps)
  □ shared deps (React, design-system): loaded once by shell, not bundled
  □ CI fails if bundle exceeds budget — no exceptions without review
  □ lazy-load all routes — no route loaded until navigated to


PR REJECTION CHECKLIST (micro frontend specific)
═══════════════════════════════════════════════════════════════

  [auto] MFE imports source from another MFE?                      REJECT
  [auto] MFE imports from shell source?                            REJECT
  [auto] direct API call in a component (not in a hook or feature)?REJECT
  [auto] business logic in shell/router/?                          REJECT
  [auto] domain state stored in shell?                             REJECT
  [auto] event emitted without matching schema in shared/contracts? REJECT
  [auto] mfe-contract.yaml routes not all implemented?             REJECT
  [auto] bundle exceeds size budget?                               REJECT
  [auto] design-system version outside allowed range?              REJECT
  [auto] visual change not reviewed in chromatic?                  REJECT
  [auto] linter warnings > 0?                                      REJECT
  [auto] TypeScript errors > 0?                                    REJECT
  [auto] test coverage below 80%?                                  REJECT

  [manual] MFE not runnable standalone (without shell)?            REJECT
  [manual] state shared between two MFEs without event bus?        REJECT
  [manual] MFE calling another MFE's backend API directly?         REJECT
  [manual] component importing from design-system internals?       REJECT
  [manual] page component containing business logic?               REJECT
  [manual] feature/A importing feature/B non-index file?           REJECT


MIGRATION — existing monolithic frontend
═══════════════════════════════════════════════════════════════

Phase 0 — Audit
  □ map all routes — which features logically group together?
  □ map all shared state — what truly needs to be global?
  □ map all cross-feature imports
  □ identify natural domain boundaries (auth, payments, settings, etc)
  □ record all violations in coupling-map.md

Phase 1 — Extract design system
  □ extract all shared components to design-system package
  □ publish to internal npm registry
  □ monolith consumes design-system as external dependency
  □ DO NOT extract any business components yet

Phase 2 — Add shell
  □ create shell app that loads the monolith as a single MFE
  □ monolith wrapped as one remote module federation entry
  □ shell handles routing to monolith
  □ validate that shell + monolith = identical user experience

Phase 3 — Strangle (one domain at a time)
  □ extract one domain to its own MFE
  □ shell routes those URLs to the new MFE
  □ monolith routes those URLs to shell redirect
  □ new MFE calls backend API directly (not through monolith)
  □ repeat per domain — never extract two at once

Phase 4 — Harden
  □ enforce no cross-MFE imports in CI
  □ enforce bundle budgets
  □ enforce contract tests
  □ monolith is eventually empty and retired