/**
 * `@salon/ui/i18n` — the locale routing policy and the UI dictionaries.
 *
 * A subpath of its own, holding no components, because a Site's `proxy.ts` and
 * `i18n/request.ts` import from here and both run outside React.
 *
 * Measured, not assumed, back when `localeAlternates` was still exported from
 * the main barrel: re-exporting `routing` from there and importing it in
 * `proxy.ts` failed `next build`, because the barrel then reached `next-intl`'s
 * server navigation, which reaches the Site's own `i18n/request.ts` and from
 * there `next/root-params` — and that "can only be used inside the App
 * Directory". `localeAlternates` lives behind `@salon/ui/seo` now, so that
 * particular chain is gone; the split is not, because `proxy.ts` has no use for
 * a Section either way.
 */
export { routing } from "./routing";
export { UI_MESSAGES } from "./messages";
