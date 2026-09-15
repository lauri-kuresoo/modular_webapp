import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Link and path helpers bound to this platform's `routing`.
 *
 * Everything that builds a URL goes through these rather than through
 * `next/link` and a hand-written `/en/...`, because they are the seam that would
 * absorb localised path segments: adding a `pathnames` map to `routing` would
 * change what they produce and nothing else would have to be touched.
 */
export const { Link, usePathname, getPathname } = createNavigation(routing);
