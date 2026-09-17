"use client";

import { LOCALES, type Locale } from "@salon/core";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { getPathname, usePathname } from "../i18n/navigation";

/**
 * Each language is named in its own language, so a Visitor who reads neither the
 * page nor the other option can still recognise their own. That makes these
 * names constants rather than dictionary entries: they do not change with the
 * active locale, so there is nothing to translate.
 */
const LOCALE_NAMES: Record<Locale, string> = {
  et: "Eesti",
  en: "English",
};

/**
 * Switches locale without leaving the page.
 *
 * `usePathname` returns the route as this platform knows it — locale prefix
 * already stripped — and `getPathname` puts the target locale's prefix back, so
 * the Visitor lands on the same page rather than on the other locale's front
 * page. That is also what makes the switcher survive localised path segments if
 * they are ever adopted: both halves go through
 * `@salon/ui/src/i18n/navigation`, which is the same seam `alternates.ts` builds
 * `hreflang` URLs with, so a link and the `hreflang` naming it cannot disagree.
 *
 * `next/link` rather than `next-intl`'s `Link`, because passing that one a
 * `locale` prop sets `forcePrefix`, and the Estonian entry then pointed at
 * `/et` — a URL the proxy answers with a 307 to `/`, on a page whose own
 * `rel="canonical"` says `/`. Read from next-intl 4.14's source: with
 * `localeCookie: false` all its `Link` adds over `next/link` is that forced
 * prefix, the `hrefLang` set explicitly below, and `prefetch={false}`. Prefetch
 * is wanted here — both locales are prerendered static HTML.
 *
 * The one client component on a Site, and it is one because the current path is
 * only knowable in the browser. It renders real `<a>` elements, so it still
 * works before its JavaScript arrives.
 */
export function LocaleSwitcher() {
  const pathname = usePathname();
  const active = useLocale();
  const t = useTranslations("localeSwitcher");

  return (
    <nav aria-label={t("label")}>
      <ul className="flex items-center justify-end gap-3 px-6 py-3 text-sm">
        {LOCALES.map((locale) => (
          <li key={locale}>
            <Link
              href={getPathname({ href: pathname, locale })}
              hrefLang={locale}
              aria-current={locale === active ? "true" : undefined}
              className={
                locale === active
                  ? "text-text font-medium"
                  : "text-text-muted hover:text-accent underline underline-offset-4"
              }
            >
              {LOCALE_NAMES[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
