/**
 * `@salon/ui/seo` — what a page tells a search engine about itself.
 *
 * Separate from the main barrel because `localeAlternates` builds its URLs
 * through `next-intl`'s navigation, and that module reaches a `"use client"`
 * `BaseLink` it never renders. Re-exporting it alongside the primitives gave
 * every page that imports a `Container` a 52,525-byte client chunk of
 * `next-intl` — measured on the prerendered `_not-found.html`, which has no
 * behaviour to hydrate at all.
 *
 * It is not in `@salon/ui/i18n` for the opposite reason: `proxy.ts` imports
 * that subpath and runs outside the App Directory, where the same navigation
 * import fails the build.
 */
export { localeAlternates } from "./alternates";
