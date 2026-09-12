import { z } from "zod";

/** Estonian is the default and renders unprefixed; English lives under `/en`. */
export const LOCALES = ["et", "en"] as const;

export const localeSchema = z.enum(LOCALES);

export type Locale = z.infer<typeof localeSchema>;

export const DEFAULT_LOCALE: Locale = "et";
