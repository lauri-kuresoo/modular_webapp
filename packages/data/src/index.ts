/**
 * `@salon/data` — `TenantRepository`, the sole gateway to Firestore. Server-only.
 *
 * May depend on `@salon/core` only, and must never be imported by `@salon/ui`:
 * Sections receive Content as props from the app layer. The repository and the
 * Admin SDK wiring land in ticket 04.
 */
export {};
