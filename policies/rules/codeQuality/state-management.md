---
trigger: always_on
---
- never write code from scratch alway use existing code

## State Management Rules — Strict Rules

### 1. Data Ownership

1. **All async state lives in Redux. No `useState` for data fetched from an API.** Local UI toggle state (`isOpen`, `busyId`) may live in `useState` only when it is never needed outside the component. Anything shared across components or persisted across navigation goes into a slice.
2. **Form field values that are submitted to an API live in Redux `ui.formFields`.** This ensures the form survives hot-reload, can be pre-filled from a deep-link, and is testable without mounting the component.
3. **A slice owns exactly one domain entity.** `campaignsSlice` owns campaigns, `recipientsSlice` owns recipients. No slice reaches into another slice's state. Cross-entity reads use two `useAppSelector` calls, never a combined selector inside the wrong slice.

---

### 2. Status & Lifecycle

4. **Status fields follow a fixed enum: `"idle" | "loading" | "succeeded" | "failed"`.** Do not invent alternatives (`"pending"`, `"fetching"`, `"done"`). Status is compared with strict equality — no substring checks.
5. **`lastAction` is reset immediately after it is consumed.** Reading `lastAction?.status === "success"` inside a `useEffect` must dispatch `resetLastAction()` before the effect returns or on the next tick. A stale `lastAction` never reset is a silent re-trigger bug.
6. **`successMessage` and `localError` are cleared before every new submission.** Before dispatching a create, update, or delete request, always dispatch `setSuccessMessage("")` and `setLocalError("")`. A previous success or error must never persist into a new operation.

---

### 3. Side Effects & Storage

7. **Never read from `localStorage` or `sessionStorage` directly inside a React render cycle.** Reads from storage happen inside `useEffect` only. The value is then dispatched into Redux state and read from the selector from that point on.
8. **Optimistic updates are banned unless explicitly approved per feature.** All state mutations are driven by server responses. Pending UI is expressed via `status === "loading"`, not by mutating items before confirmation.

---

### 4. Selectors

9. **Selectors are stable references — never construct a new object or array inside `useAppSelector`.** Wrong:
   ```ts
   useAppSelector(s => ({ a: s.x.a, b: s.x.b })) // new object every render
   ```
   Correct: select primitives individually, or use `createSelector` / `useMemo`.
10. **Global UI state (sidebar open, theme, notifications badge) lives in a dedicated `uiSlice`.** It is never co-located in a domain slice.
