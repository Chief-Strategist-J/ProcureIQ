---
trigger: always_on
---
- never write code from scratch alway use existing code

## React / Redux Hook & State Rules — Strict Rules

### 1. Structure

1. **No classes for component or hook state.** Hooks return plain objects. A class instantiated inside a hook creates a new object with new method references every render, silently breaking `useCallback` / `useMemo` / `React.memo`. Organize with named functions instead. No exceptions.
2. **Every function returned from a hook is wrapped in `useCallback`.** No bare arrow functions, no inline closures in the return object. An unstable reference passed to a child or used as an effect dependency is a bug, not a style issue.
3. **Every derived or computed value is `useMemo`, never a getter.** Getters recompute per property access, not per render — they hide re-render cost. All derived values go through `useMemo` with an explicit dependency array.
4. **One hook = one flat returned object.** No nested state objects unless a child component needs the whole sub-object as a single prop. Destructure form fields with defaults directly in hook scope.

---

### 2. Correctness

5. **Use `??` for nullish fallback, never `||`, when `0`, `""`, or `false` are valid values.** `||` silently swallows falsy values. `??` only falls back on `null` and `undefined`.
6. **After `parseInt` or `parseFloat`, check `Number.isNaN()` explicitly. Do not rely on truthiness.** Always pass radix `10`:
   ```ts
   const n = parseInt(s, 10);
   if (!Number.isNaN(n)) { /* safe */ }
   ```
7. **Effects that fetch on mount depend on a stable `useCallback`, not a duplicated inline `dispatch(...)`.** Correct pattern:
   ```ts
   const fetchItems = useCallback(() => { dispatch(fetchRequest()); }, [dispatch]);
   useEffect(() => { fetchItems(); }, [fetchItems]);
   ```
   Never: `useEffect(() => { dispatch(fetchRequest()); }, [dispatch])` when `fetchItems` already exists.

---

### 3. Hygiene

8. **No unused destructured state.** Every selected field is either used in this file or intentionally re-exported. Remove selectors that produce values never referenced.
9. **No `as any`.** It is always a real type gap. Fix the generic, use `Omit<T, "id">`, typed conditional spreads, or write the interface by hand. Casting to `any` is a rule violation.
10. **Delete before adding.** Before writing a new handler or selector, check whether an existing one can take a parameter instead. Two near-identical functions that differ only by payload are merged into one with an optional argument:
    ```ts
    // wrong: openCreateModal + openEditModal
    // correct:
    const openModal = useCallback((item?: T) => { ... }, [dispatch]);
    ```
    This applies to selectors too — two near-identical selectors become one parameterized selector.

---

### 4. Code Reduction — Governed by One Principle

> A reduction only counts if a new engineer can still read the code top-to-bottom without opening a second file. Fewer lines that require unrolling a loop, table, or generic in the reader's head is not simplification — it is compression, and gets rejected.

11. **Repeated CRUD patterns across 2+ entities collapse into one factory or loop — only if every entity follows the exact same shape.** The moment one entity needs a different action set, pull it back out and write it explicitly.
12. **Do not chain more than 2 utility types (`Pick`, `Omit`, `ReturnType`) to derive one interface.** Past that, write the interface by hand.
13. **Only merge two dispatched actions into one if neither is ever dispatched independently elsewhere.**
14. **Prefer deleting a feature or branch over cleverly compressing it.** Fewer branches beats fewer characters.
