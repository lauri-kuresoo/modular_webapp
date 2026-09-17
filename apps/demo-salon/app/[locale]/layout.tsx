import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LocaleSwitcher } from "@salon/ui/chrome";
import { routing } from "@salon/ui/i18n";
import { NextIntlClientProvider } from "next-intl";
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

  return (
    <SiteDocument locale={locale}>
      {/*
       * The provider carries the dictionary to the client components below it;
       * it takes no props because it inherits locale and messages from the
       * configuration `i18n/request.ts` resolved for this render, which is the
       * same configuration a Server Component reads.
       *
       * Taking no props also means the whole locale dictionary is serialised
       * into the RSC payload of every page, including keys only Server
       * Components read. That is a few hundred bytes today. The moment it stops
       * being — tickets 06–12 add booking labels and form errors, most of them
       * server-side — the fix is to name the namespaces the client actually
       * needs here, which is a `messages={pick(...)}` prop and no other change.
       */}
      <NextIntlClientProvider>
        <LocaleSwitcher />
        {children}
      </NextIntlClientProvider>
    </SiteDocument>
  );
}
