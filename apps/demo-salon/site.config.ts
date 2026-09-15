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
