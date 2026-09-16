import { localeSchema } from "@salon/core";
import { UI_MESSAGES } from "@salon/ui/i18n";
import { getRequestConfig } from "next-intl/server";
import { locale as localeRootParam } from "next/root-params";

/**
 * What `next-intl` resolves for each render: which locale it is, and the
 * dictionary to read UI strings from.
 *
 * Plumbing, not policy — the locale set and the URL strategy live in
 * `@salon/ui/i18n`, and so do the dictionaries. This file exists at this path
 * because that is where `next-intl`'s plugin looks for it.
 *
 * The locale comes from the `[locale]` root param, which is a build-time value
 * during prerendering, so reading it keeps every page prerenderable. It is
 * parsed rather than trusted: an unparseable value means a page outside the
 * `[locale]` segment rendered, and the platform would rather that be a failed
 * build than a page silently served in Estonian.
 */
export default getRequestConfig(async () => {
  const locale = localeSchema.parse(await localeRootParam());

  return { locale, messages: UI_MESSAGES[locale] };
});
