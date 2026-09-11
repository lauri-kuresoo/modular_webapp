import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Workspace packages ship as TypeScript source, not built artefacts, so Next
   * compiles them itself. Every new `packages/*` consumed here must be listed.
   */
  transpilePackages: ["@salon/core", "@salon/theme", "@salon/ui"],
};

export default nextConfig;
