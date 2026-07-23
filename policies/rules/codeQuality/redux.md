---
trigger: always_on
---
- never write code from scratch alway use existing code

## Redux Architecture Rules — Strict Rules

### 1. Slice & Factory

1. **Every new entity CRUD pattern uses `createListSlice<T>(name)` — never hand-write a slice.** If `createListSlice` cannot support the new entity without modification, extend the factory once. Never write a one-off slice that duplicates the same reducer shape.
2. **`createListSlice` is the single source of truth for UI state shape.** `ListUiState` fields (`searchQuery`, `isModalOpen`, `modalMode`, `editingId`, `formFields`, `saving`, `localError`, `successMessage`) are not re-declared locally in a hook. They are consumed via destructuring from the selector result.
3. **Slice reducers do not call other slices' actions.** A reducer is a pure function over its own state. Cross-slice coordination is done in sagas, never inside `createSlice.reducers`.
4. **`extraReducers` is only used to respond to actions from a different slice — never to duplicate logic already in `reducers`.**

---

### 2. Saga Registration

5. **Saga registration is table-driven, not repeated per action.** Register `takeLatest` handlers by iterating over a typed `[actions, handlers]` pair array. Adding a new entity means adding one row to the table, not writing 4–6 new `yield takeLatest(...)` lines:
   ```ts
   const entities = [
     [campaignsActions, campaignsHandlers],
     [recipientsActions, recipientsHandlers],
   ] as const;

   export function* rootSaga() {
     for (const [actions, handlers] of entities) {
       yield takeLatest(actions.fetchRequest.type, handlers.fetchSaga);
       yield takeLatest(actions.createRequest.type, handlers.createSaga);
       yield takeLatest(actions.updateRequest.type, handlers.updateSaga);
       yield takeLatest(actions.deleteRequest.type, handlers.deleteSaga);
     }
   }
   ```

---

### 3. Actions & Types

6. **Action type strings are never hardcoded as string literals.** Always use `actions.someAction.type`. Comparing `action.type === "campaigns/fetchRequest"` as a raw string is banned.
7. **`PayloadAction` types are explicit — no `PayloadAction<any>`.** Every action creator has a concrete payload type. Use `PayloadAction<void>` for actions with no payload instead of omitting the type.

---

### 4. Dependency Direction

8. **Sagas do not import from page components or hooks.** The dependency graph is strictly: `page → hook → slice/saga`. Sagas only import from slices, API clients, and shared utilities.
9. **The Redux store shape is never accessed directly via `store.getState()` inside React components.** Always use `useAppSelector`. `store.getState()` is only legal inside sagas and middleware.
10. **No `dispatch` calls inside `useMemo` bodies.** Side effects belong in `useEffect` or in event handlers (`useCallback`). A `useMemo` that dispatches is a hidden side effect that fires on every dependency change — it is a rule violation.
