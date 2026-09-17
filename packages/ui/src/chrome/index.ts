/**
 * `@salon/ui/chrome` — what surrounds a page, rather than what fills it.
 *
 * A subpath of its own, for the same reason `@salon/ui/i18n` is one: the
 * platform's only `"use client"` component lives here, and a barrel that
 * re-exported it handed its chunk to every route that imported so much as a
 * primitive. Measured on the prerendered `_not-found.html`, which renders one
 * `Container` and nothing interactive at all: 430,837 bytes in a real `<script>`
 * tag, for markup with no behaviour to hydrate. Most of that was the Zod
 * runtime, which the `@salon/core/locale` split has since taken out of the
 * client graph; re-exporting the switcher from the main barrel and rebuilding
 * now charges the 404 55,547 bytes of `next-intl` and switcher instead. Smaller
 * bill, same argument: a page with nothing to hydrate should pay neither.
 */
export { LocaleSwitcher } from "./locale-switcher";
