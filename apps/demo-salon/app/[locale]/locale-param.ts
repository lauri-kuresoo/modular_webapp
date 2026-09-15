import { localeSchema, type Locale } from "@salon/core";

/**
 * The locale this render is for, parsed out of the route segment.
 *
 * Parsed rather than cast: `[locale]` is a dynamic segment, so its value is a
 * string as far as the type system is concerned, and `dynamicParams = false`
 * plus the proxy are runtime guards that `tsc` cannot see. This is the boundary
 * where the Site stops dealing in strings.
 */
export async function localeParam(params: Promise<{ locale: string }>): Promise<Locale> {
  return localeSchema.parse((await params).locale);
}
