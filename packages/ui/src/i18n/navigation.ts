import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Path helpers bound to this platform's `routing`.
 *
 * Everything that builds a URL goes through these rather than through a
 * hand-written `/en/...`, because they are the seam that would absorb localised
 * path segments: adding a `pathnames` map to `routing` would change what they
 * produce and nothing else would have to be touched.
 *
 * `getPathname` is a pure function of `routing` — no hooks, no server-only
 * imports — so the same seam serves `alternates.ts` in a Server Component and
 * the `LocaleSwitcher` in a client one. `createNavigation` also returns a `Link`
 * and a `useRouter`; neither is destructured here because neither has a caller
 * yet.
 */
export const { usePathname, getPathname } = createNavigation(routing);
