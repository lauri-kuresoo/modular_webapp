import { z } from "zod";

/** Estonian is the default and renders unprefixed; English lives under `/en`. */
export const LOCALES = ["et", "en"] as const;

export const localeSchema = z.enum(LOCALES);

export type Locale = z.infer<typeof localeSchema>;

/**
 * `satisfies` rather than an annotation, so this keeps the literal type "et".
 * That is what lets the fallback chain in `resolveContent` reach the one locale
 * a `LocalizedText` structurally guarantees; annotated as `Locale`, indexing by
 * it would widen back to `string | undefined` and the guarantee would be lost.
 */
export const DEFAULT_LOCALE = "et" satisfies Locale;
