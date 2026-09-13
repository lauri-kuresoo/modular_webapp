/**
 * `@salon/data` — `TenantRepository`, the sole gateway to Firestore.
 *
 * `server-only` is imported here, at the single entry point, rather than left
 * to each module: importing this package from a client component is then a
 * build error instead of a service account shipped to a browser.
 *
 * May depend on `@salon/core` only, and must never be imported by `@salon/ui`:
 * Sections receive Content as props from the app layer, which is what keeps the
 * Admin SDK out of Site bundles.
 */
import "server-only";

export { forTenant, type TenantRepository } from "./tenant-repository";
