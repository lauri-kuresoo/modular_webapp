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
     * What Next documents as the switch for `app/global-not-found.tsx` — the
     * only way to give a 404 the Site's own document when the root layout lives
     * under `[locale]`. On the builder this repo actually uses it switches on
     * nothing: Next 16 defaults to Turbopack, which honours the file convention
     * either way. Measured, by deleting this whole `experimental` key and
     * rebuilding from a wiped `.next` with `--force`: `_not-found.html` came out
     * unchanged, `lang="et"` and all 76 of the Theme's `--token-` properties.
     * Control, flag kept and the file deleted: a bare `<html>` and none of them.
     *
     * Kept regardless, because it is what the shipped docs say and it is what
     * the webpack path reads — `isGlobalNotFoundEnabled` in Next's own
     * `build/entries.js` gates the convention on it, so a build with `--webpack`
     * would need it. Cheap to keep, too: `next.config.ts` is typed `NextConfig`
     * and `next build` type-checks it, so a renamed or misspelled key is a
     * TS2561 and a failed build rather than a flag that quietly stops meaning
     * anything.
     */
    globalNotFound: true,
  },
};

/**
 * Wires `i18n/request.ts` into the Server Components that read UI strings.
 * Without it `useTranslations` has no dictionary and throws.
 */
export default createNextIntlPlugin()(nextConfig);
