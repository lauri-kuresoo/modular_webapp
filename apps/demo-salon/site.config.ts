import { tenantId, type TenantId } from "@salon/core";
import type { ThemeName } from "@salon/theme";

/**
 * The Theme this Site renders in.
 *
 * This is the single value that swaps the whole look — colours, type pairing,
 * radius, density and shadow level together. Change it to `"slate"` and the
 * page becomes sharp and dense; nothing else in the Site changes, and no
 * Section is aware either way.
 *
 * In ticket 15 the Tenant picks this from the admin and it moves onto the
 * content document. It stays a build-time value there too: the Site resolves the
 * preset when it is generated, so there is no runtime Theme lookup.
 */
export const SITE_THEME: ThemeName = "linen";

/**
 * The Tenant whose Content this Site serves, baked in at build time by the
 * Vercel project that deploys it.
 *
 * A build-time variable rather than a lookup from the request's `Host`: each
 * Site is its own deployment, so there is nothing to resolve, and a header
 * cannot be spoofed into serving another Tenant's words.
 *
 * The fallback is this Site's own slug, which is the id the provisioning script
 * in ticket 27 will give it. It only applies to a build with no `TENANT_ID`,
 * and such a build has no Firebase credential either — so it reads no Content
 * at all and the fallback can never name a *different* Tenant.
 */
export const SITE_TENANT: TenantId = tenantId(process.env.TENANT_ID ?? "demo-salon");
