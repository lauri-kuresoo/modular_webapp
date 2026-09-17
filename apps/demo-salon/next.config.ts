import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /**
   * Workspace packages ship as TypeScript source, not built artefacts, so Next
   * compiles them itself. Every new `packages/*` consumed here must be listed.
   */
  transpilePackages: ["@salon/core", "@salon/data", "@salon/theme", "@salon/ui"],
  experimental: {
    /**
     * Switches on `app/global-not-found.tsx`, which is the only way to give a
     * 404 the Site's document when the root layout lives under `[locale]`.
     * Still behind a flag in Next 16.3; the alternative was a 404 served with
     * no `lang` and no Theme, so the flag is the lesser risk.
     */
    globalNotFound: true,
  },
};

/**
 * Wires `i18n/request.ts` into the Server Components that read UI strings.
 * Without it `useTranslations` has no dictionary and throws.
 */
export default createNextIntlPlugin()(nextConfig);
