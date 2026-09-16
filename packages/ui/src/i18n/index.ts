/**
 * `@salon/ui/i18n` — the locale routing policy and the UI dictionaries.
 *
 * A subpath of its own, holding no components, because a Site's `proxy.ts` and
 * `i18n/request.ts` import from here and both run outside React.
 *
 * Measured, not assumed: re-exporting `routing` from the main barrel and
 * importing it in `proxy.ts` fails `next build`. The barrel reaches
 * `localeAlternates`, which reaches `next-intl`'s server navigation, which
 * reaches the Site's own `i18n/request.ts` and from there `next/root-params` —
 * and that "can only be used inside the App Directory".
 */
export { routing } from "./routing";
export { UI_MESSAGES } from "./messages";
