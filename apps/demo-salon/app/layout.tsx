import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { themePreset, themeStyleSheet } from "@salon/theme";
import { SITE_THEME } from "../site.config";
import { typefaceClassNames } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
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
 * Resolved once, at module scope, so it is computed during the build rather than
 * per request. Both are pure functions of a constant.
 */
const preset = themePreset(SITE_THEME);
const themeCss = themeStyleSheet(SITE_THEME);

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="et" className={typefaceClassNames(preset.type)}>
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
