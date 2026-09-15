import { routing } from "@salon/ui/i18n";
import createMiddleware from "next-intl/middleware";

/**
 * Maps the public URL shape onto the `[locale]` segment: `/` renders Estonian
 * and `/en` renders English, and a request for `/et` is redirected to `/` so
 * only one URL serves each page.
 *
 * It rewrites; it does not negotiate. `routing` has locale detection off, so
 * this never reads `Accept-Language` and never sets a cookie, and the page it
 * rewrites to is the prerendered one — no Firestore read reaches public traffic.
 */
export default createMiddleware(routing);

export const config = {
  /**
   * Written out here rather than exported from `@salon/ui` because Next reads
   * this object statically, out of the module text, and cannot follow an import
   * to find it.
   *
   * Skips anything with a file extension and Next's own internals, so static
   * assets are served without a locale decision being made about them.
   */
  matcher: "/((?!_next|_vercel|.*\\..*).*)",
};
