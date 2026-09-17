import type { Locale } from "@salon/core";
import { THEME_PRESETS, themeStyleSheet } from "@salon/theme";
import type { Viewport } from "next";
import type { ReactNode } from "react";
import { SITE_THEME } from "../site.config";
import { typefaceClassNames } from "./fonts";
import "./globals.css";

/**
 * Next reads `viewport` off the route module itself, so each of the two document
 * roots has to export it; this is the one copy they both export, for the same
 * reason the markup below is shared.
 */
export const SITE_VIEWPORT: Viewport = {
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
 * Resolved once, at module scope, so it is computed during the build rather than
 * per request. A constant lookup and a pure function of a constant.
 */
const preset = THEME_PRESETS[SITE_THEME];
const themeCss = themeStyleSheet(SITE_THEME);

/**
 * The Site's HTML document: its language, its Theme and its typefaces.
 *
 * A component rather than simply the body of the root layout, because this Site
 * has two document roots. `app/[locale]/layout.tsx` is the root for every real
 * page; `app/global-not-found.tsx` is a second root, for URLs matching no route
 * at all — Next renders those outside the `[locale]` segment, where no layout
 * beneath it can reach them. Keeping the document here is what stops a root from
 * omitting part of it: while the shell lived in the locale layout alone, every
 * 404 — `/nope`, and every dotted path such as `/favicon.ico`, which `proxy.ts`
 * deliberately lets fall through — was served as a bare `<html>` with no `lang`
 * and not one of the Theme's `--token-*` custom properties.
 */
export function SiteDocument({ locale, children }: { locale: Locale; children: ReactNode }) {
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
      <body className="bg-surface text-text min-h-dvh antialiased">{children}</body>
    </html>
  );
}
