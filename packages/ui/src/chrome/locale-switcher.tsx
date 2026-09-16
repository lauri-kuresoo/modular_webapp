"use client";

import { LOCALES, type Locale } from "@salon/core";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "../i18n/navigation";

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
 * already stripped — and `Link` puts the target locale's prefix back, so the
 * Visitor lands on the same page rather than on the other locale's front page.
 * That is also what makes the switcher survive localised path segments if they
 * are ever adopted: both halves go through `@salon/ui/src/i18n/navigation`.
 *
 * An explicit `locale` prop makes `next-intl` force the prefix on, so the
 * Estonian entry renders `/et` even though Estonian is unprefixed, and the proxy
 * answers `/et` with a redirect to `/`. One redirect on a click, and `/et` still
 * serves no page of its own; building the href by hand to avoid it would put a
 * second URL-shaping rule outside `routing`, which is the thing this platform is
 * keeping to one place.
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
              href={pathname}
              locale={locale}
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
