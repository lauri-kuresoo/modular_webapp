/**
 * `@salon/ui/chrome` — what surrounds a page, rather than what fills it.
 *
 * A subpath of its own, for the same reason `@salon/ui/i18n` is one: the
 * platform's only `"use client"` component lives here, and a barrel that
 * re-exported it handed its chunk to every route that imported so much as a
 * primitive. Measured on the prerendered `_not-found.html`, which renders one
 * `Container` and nothing interactive at all: 430,837 bytes of `LocaleSwitcher`
 * and next-intl client navigation, in a real `<script>` tag, for markup that
 * has no behaviour to hydrate.
 */
export { LocaleSwitcher } from "./locale-switcher";
