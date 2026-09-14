import { forTenant } from "@salon/data";
import { ComposedPage } from "@salon/ui";
import { HOME_COMPOSITION } from "../composition";
import { SITE_TENANT } from "../site.config";

/**
 * Generated at build time, explicitly. Public traffic must cause zero Firestore
 * reads, so no page in a Site may render at request time — the Tenant's Content
 * is fetched here, once per build, and ticket 12's publish webhook is what
 * refreshes it afterwards.
 */
export const dynamic = "force-static";

/**
 * The whole page: a fold of the Composition over the Section Registry, given the
 * Tenant's Content. Nothing about what this Site says lives here — the layout is
 * `../composition.ts` and the words are the Tenant's own, in Firestore.
 *
 * This is the only layer allowed to reach `@salon/data`. Sections are handed
 * Content as an argument, which is what keeps the Firestore Admin SDK out of
 * `@salon/ui` and out of anything a browser loads.
 */
export default async function HomePage() {
  const content = await forTenant(SITE_TENANT).content();

  return (
    <main>
      <ComposedPage composition={HOME_COMPOSITION} content={content} />
    </main>
  );
}
