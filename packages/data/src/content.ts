import { contentDocumentSchema, type SectionContent, type TenantContent } from "@salon/core";
import type { TenantId } from "@salon/core";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { FIRESTORE } from "./firestore";

/** The subcollection of `tenants/{tenantId}` holding one document per Section. */
const CONTENT_COLLECTION = "content";

/**
 * Reads a Tenant's Content, cached under a tag of its own.
 *
 * The cache is what makes the spec's "zero Firestore reads on public traffic"
 * true: a Site's pages are generated once against this read and served from the
 * edge afterwards. Ticket 12's publish webhook calls `revalidateTag` with the
 * same tag, so a Tenant's edit reaches the Site without a rebuild.
 *
 * `unstable_cache` rather than a `"use cache"` function: the latter requires
 * Next's `cacheComponents` mode, which rejects the `dynamic = "force-static"`
 * that every Site page declares to prove it never renders per request.
 */
export function readContent(tenantId: TenantId): Promise<TenantContent> {
  return unstable_cache(() => fetchContent(tenantId), [CONTENT_COLLECTION, tenantId], {
    tags: [contentTag(tenantId)],
  })();
}

function contentTag(tenantId: TenantId): string {
  return `tenant:${tenantId}:content`;
}

/**
 * One collection read per Tenant, scoped by path.
 *
 * Content nests under the Tenant document, so the scoping is in the path rather
 * than in a `where` clause every future query would have to remember — and
 * fetching the whole subcollection in one round trip is what keeps
 * one-document-per-Section from costing one read per Section.
 */
async function fetchContent(tenantId: TenantId): Promise<TenantContent> {
  if (FIRESTORE === undefined) {
    // The unconfigured deployment described on `FIRESTORE`; already warned about.
    return {};
  }
  const documents = await FIRESTORE.collection("tenants")
    .doc(tenantId)
    .collection(CONTENT_COLLECTION)
    .get();

  return Object.fromEntries(documents.docs.map((document) => [document.id, parse(document)]));
}

/**
 * Firestore is schemaless and its documents drift — a field renamed by hand, a
 * number where text belongs. Parsing every read is the only thing standing
 * between that drift and a Site, so a failure names the document path and the
 * offending field and stops the build.
 */
function parse(document: QueryDocumentSnapshot): SectionContent {
  const content = contentDocumentSchema.safeParse(document.data());
  if (!content.success) {
    throw new Error(
      `Firestore document ${document.ref.path} is not a Content document.\n` +
        z.prettifyError(content.error),
    );
  }
  return content.data;
}
