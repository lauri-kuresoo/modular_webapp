import { DEFAULT_LOCALE, LOCALES, type Locale } from "@salon/core/locale";
import type { Metadata } from "next";
import { getPathname } from "../i18n/navigation";

/**
 * The canonical URL of one page in the locale being rendered, plus a reciprocal
 * `hreflang` link to each locale's version of the same page.
 *
 * Without these two pointing at each other, Google reads the Estonian and
 * English pages as duplicate content and picks one — which costs the Tenant the
 * search visibility that is the main reason they bought a Site.
 *
 * `x-default` names the version to serve a Visitor whose language matches
 * neither. It is Estonian, the same page `/` already serves, which is consistent
 * with this platform doing no `Accept-Language` negotiation of its own.
 *
 * Paths, not whole URLs: Next resolves them against the layout's
 * `metadataBase`, so the Site's own origin is stated once, in the Site.
 */
export function localeAlternates(href: string, locale: Locale): Metadata["alternates"] {
  const urlFor = (target: Locale) => getPathname({ href, locale: target });

  return {
    canonical: urlFor(locale),
    languages: {
      ...Object.fromEntries(LOCALES.map((target) => [target, urlFor(target)])),
      "x-default": urlFor(DEFAULT_LOCALE),
    },
  };
}
