import { tenantId, type TenantId } from "@salon/core";
import { FIRESTORE } from "./firestore";

const TENANT_VARIABLE = "TENANT_ID";

/**
 * The id a process with neither a Tenant nor a credential reads under.
 *
 * It never reaches Firestore — that process has no connection to send it down —
 * so it exists only to give `forTenant` the branded id its signature asks for.
 * A literal Tenant slug here is what leaks: ticket 27 scaffolds a Site by
 * copying this repo's, and a copied-forward slug plus a forgotten `TENANT_ID`
 * would publish the original Tenant's Content under the new Site's domain.
 */
const NO_TENANT_CONFIGURED = "tenant-id-not-set";

/**
 * The Tenant this Site serves, read from the environment its deployment bakes
 * in at build time.
 *
 * A build-time variable rather than a lookup from the request's `Host`: each
 * Site is its own deployment, so there is nothing to resolve, and a header
 * cannot be spoofed into serving another Tenant's words.
 *
 * **A credential without a Tenant id is a hard error.** Those two variables are
 * independent — a deployment can easily carry one and not the other — and the
 * combination is the cross-Tenant leak: a process that can read Firestore but
 * has not been told whose Content to read would fall back to *something*, and
 * whatever that something is, it is some Tenant's. Failing the build is the only
 * outcome a Site cannot be misconfigured into. Without a credential the same
 * gap is harmless, because no Content is read at all, which is what keeps this
 * repo buildable on a contributor's machine.
 *
 * This lives in `@salon/data` rather than in each Site so that a Site cannot be
 * written without the check. Tenant resolution still happens in the two places
 * the spec allows — here, for a Site, and ticket 11's admin session.
 */
export function siteTenant(): TenantId {
  const configured = process.env[TENANT_VARIABLE];
  if (configured !== undefined && configured !== "") {
    return tenantId(configured);
  }
  if (FIRESTORE !== undefined) {
    throw new Error(
      `${TENANT_VARIABLE} is not set, but a Firebase credential is. A Site that can read ` +
        `Firestore has to say whose Content it serves, or it publishes another Tenant's ` +
        `words. Set ${TENANT_VARIABLE} on this deployment.`,
    );
  }
  return tenantId(NO_TENANT_CONFIGURED);
}
