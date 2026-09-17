/**
 * `@salon/ui/chrome` — what surrounds a page, rather than what fills it.
 *
 * A subpath of its own, for the same reason `@salon/ui/i18n` is one: the
 * platform's only `"use client"` component lives here, and a barrel that
 * re-exported it handed its chunk to every route that imported so much as a
 * primitive. Measured on the prerendered `_not-found.html`, which renders one
 * `Container` and nothing interactive at all: 430,837 bytes in a real `<script>`
 * tag, for markup with no behaviour to hydrate. Only a fraction of that is the
 * switcher — most of it is the Zod runtime, which reaches the client graph
 * because `routing` imports `LOCALES` from the `@salon/core` barrel and the
 * barrel re-exports the Content schemas.
 */
export { LocaleSwitcher } from "./locale-switcher";
