import type { SectionContent, TenantContent } from "@salon/core";
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
 */
export function ComposedPage({
  composition,
  content,
}: {
  composition: Composition;
  content: TenantContent;
}) {
  return (
    <>
      {composition.map((section) => (
        <section key={section.id} id={section.id}>
          {renderSection(section, content[section.id])}
        </section>
      ))}
    </>
  );
}

function renderSection(
  section: Composition[number],
  stored: SectionContent | undefined,
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
    content: parseContent(contentSchema, stored, section.id),
  });
}

/**
 * The second parse of a Content document, and the one that knows what the
 * Section actually reads: `@salon/data` has already established that the stored
 * document is text keyed by field name, and cannot know more than that without
 * importing this package.
 *
 * A Section nobody has written a document for parses `{}` here instead. Every
 * `contentSchema` accepts that — `defineSection` refuses one that does not — so
 * a half-seeded Tenant renders empty states rather than a failed page, while a
 * document that *is* there and is wrong still throws.
 */
function parseContent(
  contentSchema: z.ZodType,
  stored: SectionContent | undefined,
  anchorId: string,
): unknown {
  const content = contentSchema.safeParse(stored ?? {});
  if (!content.success) {
    throw new Error(
      `Content for Section "${anchorId}" does not match what that Section reads.\n` +
        z.prettifyError(content.error),
    );
  }
  return content.data;
}
