/**
 * The locale vocabulary — and `@salon/core`'s only zod-free module.
 *
 * Nothing here may import zod, directly or transitively, because this is the
 * module a `"use client"` component imports. Ticket 05 measured why: the
 * `LocaleSwitcher` read `LOCALES` off the barrel, the barrel re-exports the
 * Content schemas, and Turbopack shipped 375,143 bytes of Zod runtime to every
 * Site page for a browser that parses nothing. `localeSchema` therefore lives in
 * `locale-schema.ts`, and the barrel re-exports both — so server code still
 * reaches everything from `@salon/core` and there is still one `LOCALES`.
 */

/** Estonian is the default and renders unprefixed; English lives under `/en`. */
export const LOCALES = ["et", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * `satisfies` rather than an annotation, so this keeps the literal type "et".
 * That is what lets the fallback chain in `content.ts` reach the one locale a
 * localised field structurally guarantees; annotated as `Locale`, indexing by it
 * would widen back to `string | undefined` and the guarantee would be lost.
 */
export const DEFAULT_LOCALE = "et" satisfies Locale;
