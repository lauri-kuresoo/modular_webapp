import type { TenantContent, TenantId } from "@salon/core";
import { readContent } from "./content";

/**
 * Everything the platform reads or writes for one Tenant, already scoped to it.
 *
 * No method takes a tenant argument: the id is captured when the repository is
 * created, so there is no parameter through which a caller could reach another
 * Tenant's documents. Cross-Tenant isolation is a property of this shape rather
 * than of every future query remembering a filter.
 */
export type TenantRepository = {
  /** Every Content document this Tenant has, keyed by the Section anchor id it fills. */
  content(): Promise<TenantContent>;
};

/**
 * The only way to obtain a `TenantRepository`.
 *
 * A `TenantId` is resolved in exactly two places in the platform: a Site bakes
 * one in at build time from its own environment, and ticket 11's admin takes
 * one from the signed-in session's claim. Everything downstream is handed the
 * repository and never sees the id.
 */
export function forTenant(tenantId: TenantId): TenantRepository {
  return {
    content: () => readContent(tenantId),
  };
}
