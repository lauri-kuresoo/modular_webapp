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
 * Not in `@salon/ui/i18n` either, and that one is not a judgement call:
 * `proxy.ts` imports that subpath, and re-exporting this function from it fails
 * `next build` outright — the navigation import reaches the Site's
 * `i18n/request.ts` and from there `next/root-params`, which "can only be used
 * inside the App Directory".
 */
export { localeAlternates } from "./alternates";
