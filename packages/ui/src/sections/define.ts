import type { ReactNode } from "react";
import { z } from "zod";

/**
 * Everything a Section is handed when it renders.
 *
 * A single named object rather than a positional argument list, so that adding
 * a third thing — as ticket 04 added `content` — widens one type instead of
 * every Section's signature.
 *
 * The split is the ownership boundary from the spec: `props` and `variant` are
 * Platform-Operator-owned layout that lives in git with the Composition,
 * `content` is the Tenant's own words, read from Firestore and looked up by the
 * Section's anchor id. A Section never learns which Tenant it is rendering, and
 * never reaches for content itself.
 */
export type SectionArgs<Props, Variant, Content> = {
  readonly props: Props;
  readonly variant: Variant;
  readonly content: Content;
};

/**
 * Declares one Section: the schemas for the two halves it is given, the
 * variants it is willing to render in, and the component itself.
 *
 * Inference is most of what the helper buys. `propsSchema` and `contentSchema`
 * are captured as their own concrete schema types rather than widened to
 * `z.ZodType`, so a Composition author gets the props schema's *input* type and
 * the component gets both schemas' output types — and `variants` is captured as
 * a literal tuple, so the registry can narrow `variant` per section type. All
 * three are lost the moment one is annotated by hand.
 *
 * Sections are Server Components. Nothing here accepts a `"use client"`
 * boundary on the Section's behalf: a Section that needs interactivity marks
 * its own module, and only that module, so the page stays free of client
 * JavaScript by default rather than by discipline.
 */
export function defineSection<
  const Variants extends readonly string[],
  Props extends z.ZodType,
  Content extends z.ZodType,
>(
  definition: SectionDefinition<Variants, Props, Content>,
): SectionDefinition<Variants, Props, Content> {
  rejectRequiredContent(definition.contentSchema);
  return definition;
}

type SectionDefinition<
  Variants extends readonly string[],
  Props extends z.ZodType,
  Content extends z.ZodType,
> = {
  readonly propsSchema: Props;
  /** The Tenant-editable fields this Section reads. `z.object({})` if it reads none. */
  readonly contentSchema: Content;
  /** Empty when the Section has only one look; a Composition then gives it no `variant`. */
  readonly variants: Variants;
  readonly component: (
    args: SectionArgs<z.output<Props>, Variants[number], z.output<Content>>,
  ) => ReactNode;
};

/**
 * A Tenant whose Content has not been seeded — or who has not filled in this
 * Section yet — must get the Section's empty state, not a failed page. That
 * holds only if no content field is required, so it is checked here, as the
 * Section is declared, rather than trusted to every Section author and
 * discovered by the first half-seeded Tenant.
 */
function rejectRequiredContent(contentSchema: z.ZodType): void {
  const parsed = contentSchema.safeParse({});
  if (!parsed.success) {
    throw new Error(
      `A Section's contentSchema must accept a Content document that is not there yet, ` +
        `so every field has to be optional.\n${z.prettifyError(parsed.error)}`,
    );
  }
}
