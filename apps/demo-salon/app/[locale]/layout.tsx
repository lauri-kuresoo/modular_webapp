import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SkipLink } from "@salon/ui/chrome";
import { routing } from "@salon/ui/i18n";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { SITE_URL } from "../../site.config";
import { SITE_VIEWPORT, SiteDocument } from "../site-document";
import { localeParam } from "./locale-param";

export const metadata: Metadata = {
  /**
   * Every `alternates` entry a page emits is a path, and this is what Next
   * resolves them against. Declared once here rather than per page, because a
   * Site has exactly one origin and a page that stated its own could state a
   * different one.
   */
  metadataBase: new URL(SITE_URL),
  title: "Demo Salon",
  description: "Reference Site for the modular salon platform.",
};

export const viewport = SITE_VIEWPORT;

/**
 * The locales this Site is generated for. With `dynamicParams` off on the page,
 * this list is the whole set of pages that exist — anything else is a 404 rather
 * than a page rendered per request.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = await localeParam(params);
  const t = await getTranslations("skipLink");

  return (
    <SiteDocument locale={locale}>
      {/*
       * The provider carries the dictionary to the client components below it;
       * it takes no props because it inherits locale and messages from the
       * configuration `i18n/request.ts` resolved for this render, which is the
       * same configuration a Server Component reads.
       */}
      <NextIntlClientProvider>
        <SkipLink label={t("label")} />
        {children}
      </NextIntlClientProvider>
    </SiteDocument>
  );
}
