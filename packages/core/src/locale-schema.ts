import { z } from "zod";
import { LOCALES } from "./locale";

/**
 * Parses a locale out of a URL segment or a stored Content key — the boundary
 * where the platform stops dealing in strings.
 *
 * Apart from `LOCALES` itself, on purpose: importing it costs the Zod runtime,
 * and the client component that needs the locale list does no parsing. See
 * `locale.ts`.
 */
export const localeSchema = z.enum(LOCALES);
