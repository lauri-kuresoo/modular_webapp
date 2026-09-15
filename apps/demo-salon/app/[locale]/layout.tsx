import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { THEME_PRESETS, themeStyleSheet } from "@salon/theme";
import { LocaleSwitcher } from "@salon/ui";
import { routing } from "@salon/ui/i18n";
import { NextIntlClientProvider } from "next-intl";
import { SITE_THEME, SITE_URL } from "../../site.config";
import { typefaceClassNames } from "../fonts";
import { localeParam } from "./locale-param";
import "../globals.css";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  /**
   * Tells the browser both modes are supported, so it paints its own canvas and
   * form controls to match the OS preference from the first frame instead of
   * assuming light and correcting afterwards.
   */
  colorScheme: "light dark",
};

/**
 * The locales this Site is generated for. With `dynamicParams` off on the page,
 * this list is the whole set of pages that exist — anything else is a 404 rather
 * than a page rendered per request.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Resolved once, at module scope, so it is computed during the build rather than
 * per request. A constant lookup and a pure function of a constant.
 */
const preset = THEME_PRESETS[SITE_THEME];
const themeCss = themeStyleSheet(SITE_THEME);

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = await localeParam(params);

  return (
    <html lang={locale} className={typefaceClassNames(preset.type)}>
      <head>
        {/*
         * The Theme, inlined. It is a fixed string built from typed preset data
         * at build time — no request data reaches it — and it has to be in the
         * document head rather than in a linked stylesheet so that the first
         * paint already has the right tokens. That is what makes "no flash of
         * the wrong Theme" true without a provider or any client JavaScript.
         */}
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body className="bg-surface text-text min-h-dvh antialiased">
        {/*
         * The provider carries the dictionary to the client components below it;
         * it takes no props because it inherits locale and messages from the
         * configuration `i18n/request.ts` resolved for this render, which is the
         * same configuration a Server Component reads.
         */}
        <NextIntlClientProvider>
          <LocaleSwitcher />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
