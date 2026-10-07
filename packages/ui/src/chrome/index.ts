/**
 * `@salon/ui/chrome` — what surrounds a page, rather than what fills it.
 *
 * A subpath of its own, for the same reason `@salon/ui/i18n` is one: the
 * platform's client components live here, and a barrel that re-exported them
 * handed their chunks to every route that imported so much as a primitive.
 */
export { LocaleSwitcher } from "./locale-switcher";
export { SkipLink } from "./skip-link";
export { MobileNav } from "./mobile-nav";
export { NavbarChrome, NAVBAR_SCROLL_SENTINEL_ID } from "./navbar-scroll";
