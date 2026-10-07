import type { Metadata } from "next";
import { forTenant, siteTenant } from "@salon/data";
import { ComposedPage } from "@salon/ui";
import { localeAlternates } from "@salon/ui/seo";
import { getTranslations } from "next-intl/server";
import { withDemoSeed } from "../../content/seed";
import { homeComposition } from "../../composition";
import { localeParam } from "./locale-param";

/**
 * Generated at build time, explicitly. Public traffic must cause zero Firestore
 * reads, so no page in a Site may render at request time — the Tenant's Content
 * is fetched here, once per build, and ticket 12's publish webhook is what
 * refreshes it afterwards.
 */
export const dynamic = "force-static";

/**
 * Only the locales `generateStaticParams` enumerated exist; anything else is a
 * 404. `[locale]` would otherwise act as a catch-all — measured with
 * `dynamicParams = true`, a request for `/favicon.ico` rendered this page per
 * request, loading `@salon/data` into the serving process, which is precisely
 * the Firestore read on public traffic the spec rules out.
 */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return { alternates: localeAlternates("/", await localeParam(params)) };
}

/**
 * The whole page: a fold of the Composition over the Section Registry, given the
 * Tenant's Content and the locale to render it in. Nothing about what this Site
 * says lives here — the layout is `../../composition.ts` and the words are the
 * Tenant's own (seeded for local builds without Firestore).
 *
 * This is the only layer allowed to reach `@salon/data`. Sections are handed
 * Content as an argument, which is what keeps the Firestore Admin SDK out of
 * `@salon/ui` and out of anything a browser loads.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await localeParam(params);
  const t = await getTranslations("navbar");
  const stored = await forTenant(siteTenant()).content();
  const content = withDemoSeed(stored);
  const composition = homeComposition({ open: t("openMenu"), close: t("closeMenu"), home: t("home") });

  return <ComposedPage composition={composition} content={content} locale={locale} />;
}
