import type { ThemeName } from "@salon/theme";

/**
 * The Theme this Site renders in.
 *
 * This is the single value that swaps the whole look — colours, type pairing,
 * radius, density and shadow level together. Change it to `"slate"` and the
 * page becomes sharp and dense; nothing else in the Site changes, and no
 * Section is aware either way.
 *
 * In ticket 15 the Tenant picks this from the admin and it moves onto the
 * content document. It stays a build-time value there too: the Site resolves the
 * preset when it is generated, so there is no runtime Theme lookup.
 */
export const SITE_THEME: ThemeName = "linen";

/**
 * The origin this Site is served from, and the base every canonical and
 * `hreflang` URL is resolved against.
 *
 * A constant in git rather than an environment variable: it is the same for
 * every build of this Site, and a canonical URL that varies with a deployment
 * variable is a canonical URL that can silently point a preview deployment's
 * `hreflang` at itself.
 */
export const SITE_URL = "https://demo-salon.example";

/**
 * The timezone every date and time this Site renders is formatted in.
 *
 * Stated rather than left to `next-intl`, which otherwise falls back to the
 * timezone of whatever process ran the build. Every page here is prerendered, so
 * that process is a laptop for a local build and UTC on Vercel — the same commit
 * would bake different output depending on which machine last built it, and the
 * Visitor would see whichever it was. Nothing formats a date yet; this is set
 * now because the day something does, the discrepancy is a rendered wrong hour
 * rather than a failure anyone would look for.
 *
 * The spec's Time invariant puts the Tenant's timezone on the Tenant document,
 * and that supersedes this constant when the Tenant config lands. A constant
 * here until then, not plumbing for a value nothing yet reads.
 */
export const SITE_TIME_ZONE = "Europe/Tallinn";
