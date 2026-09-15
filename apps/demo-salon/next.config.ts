import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /**
   * Workspace packages ship as TypeScript source, not built artefacts, so Next
   * compiles them itself. Every new `packages/*` consumed here must be listed.
   */
  transpilePackages: ["@salon/core", "@salon/data", "@salon/theme", "@salon/ui"],
};

/**
 * Wires `i18n/request.ts` into the Server Components that read UI strings.
 * Without it `useTranslations` has no dictionary and throws.
 */
export default createNextIntlPlugin()(nextConfig);
