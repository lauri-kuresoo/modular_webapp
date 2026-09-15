import { DEFAULT_LOCALE, LOCALES } from "@salon/core";
import { defineRouting } from "next-intl/routing";

/**
 * How every Site on this platform maps locales onto URLs.
 *
 * It lives in `@salon/ui` rather than in each Site so that no Site can invent
 * its own prefix strategy or quietly switch detection back on — the Site's
 * `proxy.ts` and `i18n/request.ts` are plumbing that reads this, not policy of
 * their own.
 *
 * - **`as-needed`**: Estonian is unprefixed at `/` and English lives under
 *   `/en`. The Tenant's own customers are Estonian, so the unprefixed root is
 *   the canonical URL they link to and Google indexes.
 * - **No locale detection**: a Visitor who lands on an Estonian URL gets the
 *   Estonian page, whatever their browser sends, and uses the `LocaleSwitcher`
 *   if they want English. Redirecting on `Accept-Language` would make one URL
 *   serve two pages, which defeats caching and surprises anyone who bookmarked
 *   or shared it.
 * - **No locale cookie**: the URL is the only thing that decides the locale,
 *   and the spec ships no consent banner on the grounds that nothing sets a
 *   cookie. A locale cookie would be the exception that breaks that claim.
 * - **No alternate `Link` headers**: `hreflang` is emitted into the document
 *   head by `localeAlternates` instead, so it is one fact in one place — and a
 *   visible one, since a header is invisible in the prerendered HTML this
 *   platform's correctness rests on.
 *
 * Path segments are *not* localised; see the decision recorded in `README.md`.
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "as-needed",
  localeDetection: false,
  localeCookie: false,
  alternateLinks: false,
});
