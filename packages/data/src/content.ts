import {
  contentDocumentSchema,
  type SectionContent,
  type TenantContent,
  type TenantId,
} from "@salon/core";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { unstable_cache } from "next/cache";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { FIRESTORE } from "./firestore";

/** The subcollection of `tenants/{tenantId}` holding one document per Section. */
const CONTENT_COLLECTION = "content";

/**
 * Scopes a cache entry to the process that wrote it, by making its key
 * unguessable to any other. See `readContent` for why an entry must not outlive
 * the build that produced it.
 */
const PROCESS_SCOPE = randomUUID();

/**
 * Reads a Tenant's Content, cached under a tag of its own.
 *
 * The tag is the whole point of the cache. Ticket 12's publish webhook calls
 * `revalidateTag` with the same `tenant:{id}:content` tag, which is what lets a
 * Tenant's edit reach their already-deployed Site without a redeploy, and
 * touches no other Tenant's pages because the tag carries the id. What makes the
 * spec's "zero Firestore reads on public traffic" true is not this cache but
 * static generation: every page that calls this is prerendered, so the serving
 * process never reads Firestore to answer a request.
 *
 * **The entry never expires, and its key is scoped to one process.** Both halves
 * are load-bearing, and the obvious middle ground — a finite `revalidate` — is
 * not available:
 *
 * `unstable_cache` lowers the enclosing page's revalidate window to match its
 * own, so `revalidate: 1` puts `initialRevalidateSeconds: 1` on `/` in the
 * prerender manifest. That is ISR on a one-second window, and public traffic
 * reads Firestore again. Measured, not reasoned: the manifest said so.
 *
 * An entry that never expires, though, outlives the build that wrote it —
 * `.next/cache` survives on disk locally and Vercel restores it into the next
 * deployment's build — so an Operator would edit Firestore, redeploy, and still
 * be served the previous build's words. The per-process key part is what stops
 * that: no build can read what an earlier build wrote, while a running server
 * still reuses its own entry until the tag invalidates it.
 *
 * `unstable_cache` rather than a `"use cache"` function: the latter requires
 * Next's `cacheComponents` mode, which rejects the `dynamic = "force-static"`
 * every Site page declares to prove it never renders per request.
 */
export function readContent(tenantId: TenantId): Promise<TenantContent> {
  return unstable_cache(
    () => fetchContent(tenantId),
    [CONTENT_COLLECTION, tenantId, PROCESS_SCOPE],
    { tags: [`tenant:${tenantId}:${CONTENT_COLLECTION}`] },
  )();
}

/**
 * One collection read per Tenant, scoped by path.
 *
 * Content nests under the Tenant document, so the scoping is the path rather
 * than a `where` clause every future query would have to remember. Fetching the
 * whole subcollection in one round trip is also what keeps one document per
 * Section from costing one read per Section.
 */
async function fetchContent(tenantId: TenantId): Promise<TenantContent> {
  if (FIRESTORE === undefined) {
    // The unconfigured process described on `FIRESTORE`, which has already said so.
    return {};
  }
  const documents = await FIRESTORE.collection("tenants")
    .doc(tenantId)
    .collection(CONTENT_COLLECTION)
    .get();

  return Object.fromEntries(
    documents.docs.map((document) => [document.id, parseContentDocument(document)]),
  );
}

/**
 * Firestore is schemaless and its documents drift — a field renamed by hand, a
 * number where text belongs. Parsing every read is the only thing standing
 * between that drift and a Site, so a failure names the document path and the
 * offending field and stops the build.
 */
function parseContentDocument(document: QueryDocumentSnapshot): SectionContent {
  const content = contentDocumentSchema.safeParse(document.data());
  if (!content.success) {
    throw new Error(
      `Firestore document ${document.ref.path} is not a Content document.\n` +
        z.prettifyError(content.error),
    );
  }
  return content.data;
}
