import { ComposedPage } from "@salon/ui";
import { HOME_COMPOSITION } from "../composition";

/**
 * Statically generated at build time, explicitly. Public traffic must cause zero
 * Firestore reads, so no page in a Site may render at request time.
 */
export const dynamic = "force-static";

/**
 * The whole page: a fold of the Composition over the Section Registry. Nothing
 * about what this Site says lives here — that is `../composition.ts`, and from
 * ticket 04 the Tenant's Content.
 */
export default function HomePage() {
  return (
    <main>
      <ComposedPage composition={HOME_COMPOSITION} />
    </main>
  );
}
