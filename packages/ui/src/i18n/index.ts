/**
 * `@salon/ui/i18n` — the locale routing policy and the UI dictionaries.
 *
 * A subpath of its own, holding no components, because a Site's `proxy.ts` and
 * `i18n/request.ts` import from here and both run outside React. Reaching them
 * through the main barrel would pull every Section into a request-path bundle.
 */
export { routing } from "./routing";
export { UI_MESSAGES } from "./messages";
