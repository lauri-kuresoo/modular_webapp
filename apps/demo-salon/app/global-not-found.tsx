import { DEFAULT_LOCALE } from "@salon/core";
import { Container } from "@salon/ui";
import { UI_MESSAGES } from "@salon/ui/i18n";
import type { Metadata } from "next";
import { SITE_VIEWPORT, SiteDocument } from "./site-document";

/**
 * Estonian for every unmatched URL, `/en/...` included. A broken English link
 * answers 404 with this page: an Estonian heading under `lang="et"`, which is
 * also what an English Visitor's screen reader will announce. So this is the one
 * page on the platform whose locale the URL does not decide.
 *
 * The alternative is worse. Next renders `global-not-found` once, at build, for
 * every URL that matched nothing; reading a locale out of the request would make
 * it the Site's only per-request route, and "zero Firestore reads on public
 * traffic" is a claim checked by every route being prerendered.
 *
 * Read out of the dictionary directly rather than through `useTranslations`,
 * because `i18n/request.ts` resolves the active locale from the `[locale]` root
 * param and this page is rendered outside that segment, where there is no such
 * param to read.
 */
const { notFound } = UI_MESSAGES[DEFAULT_LOCALE];

export const metadata: Metadata = {
  title: notFound.title,
};

export const viewport = SITE_VIEWPORT;

/**
 * What a Visitor gets for a URL this Site has no page for.
 *
 * Next renders unmatched URLs outside the root layout whenever that layout sits
 * under a dynamic segment, as `app/[locale]/layout.tsx` does — `not-found.tsx`
 * at any depth is only reached by a `notFound()` call from a route that *did*
 * match. `global-not-found` is the hook Next provides for the gap, and it owns
 * the whole document, which is why it renders `SiteDocument` itself.
 */
export default function GlobalNotFound() {
  return (
    <SiteDocument locale={DEFAULT_LOCALE}>
      <main>
        <Container width="prose">
          <div className="pt-20 pb-6">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              {notFound.title}
            </h1>
          </div>
        </Container>
      </main>
    </SiteDocument>
  );
}
