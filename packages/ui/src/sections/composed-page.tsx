import { resolveContent, type Locale, type SectionContent, type TenantContent } from "@salon/core";
import type { ReactNode } from "react";
import { z } from "zod";
import type { Composition } from "./composition";
import type { SectionArgs } from "./define";
import { SECTION_REGISTRY } from "./registry";

/**
 * A Site's page, rendered by folding its Composition against the Section
 * Registry. There is no switch on section type here and no roster of Sections —
 * reordering or re-parameterising a page is an edit to the Composition alone.
 *
 * Each Section is wrapped in a `<section>` carrying its anchor id. That wrapper
 * lives here, not in the Sections, so a Section cannot be written without one.
 * Vertical rhythm deliberately stays with the Section: a full-bleed Hero and a
 * run of paragraphs do not share one, and a padded wrapper would leave ticket 06
 * cancelling it out.
 *
 * `content` is required rather than defaulted. A page that renders without it
 * would be a Site quietly serving none of its Tenant's words, and the whole
 * point of the prop is that the app layer — the only layer allowed to touch
 * `@salon/data` — is the one that fetched it.
 *
 * `locale` is a prop rather than something read from `next-intl`'s server
 * context, so this stays a pure function of its arguments: the guarantee that
 * every Site page prerenders is the one thing this platform cannot afford to
 * make conditional on a request-scoped lookup. A required prop cannot be
 * forgotten either — omitting it is a type error.
 */
export function ComposedPage({
  composition,
  content,
  locale,
}: {
  composition: Composition;
  content: TenantContent;
  locale: Locale;
}) {
  return (
    <>
      {composition.map((section) => (
        <section key={section.id} id={section.id}>
          {renderSection(section, content[section.id], locale)}
        </section>
      ))}
    </>
  );
}

function renderSection(
  section: Composition[number],
  stored: SectionContent | undefined,
  locale: Locale,
): ReactNode {
  const { component, contentSchema } = SECTION_REGISTRY[section.type];
  /*
   * `defineComposition` is what makes this assertion sound: `props` is whatever
   * this entry's own `propsSchema` produced and `variant` is one it declared.
   * TypeScript has no way to say "some Props, the same on both sides of the
   * registry lookup", so the pairing is asserted once, here, rather than every
   * Section having to re-establish it.
   */
  const render = component as (
    args: SectionArgs<unknown, string | undefined, unknown>,
  ) => ReactNode;
  return render({
    props: section.props,
    variant: section.variant,
    content: parseContent(contentSchema, stored, locale, section.id),
  });
}

/**
 * The fold's single locale resolution, and the second parse of a Content
 * document — the one that knows what the Section actually reads. `@salon/data`
 * has already established that the stored document is per-locale text keyed by
 * field name, and cannot know more than that without importing this package.
 *
 * Resolving here, once, is what makes the fallback chain unbypassable: a Section
 * is handed plain strings, so its `contentSchema` reads `z.string().optional()`
 * and it never holds the locale map it could have indexed wrongly. Ticket 06's
 * Sections inherit that without doing anything.
 *
 * A Section nobody has written a document for resolves `{}` here instead. Every
 * `contentSchema` accepts that — `defineSection` refuses one that does not — so
 * a half-seeded Tenant renders empty states rather than a failed page, while a
 * document that *is* there and is wrong still throws.
 */
function parseContent(
  contentSchema: z.ZodType,
  stored: SectionContent | undefined,
  locale: Locale,
  anchorId: string,
): unknown {
  const content = contentSchema.safeParse(resolveContent(stored ?? {}, locale));
  if (!content.success) {
    throw new Error(
      `Content for Section "${anchorId}" does not match what that Section reads.\n` +
        z.prettifyError(content.error),
    );
  }
  return content.data;
}
