import type { ReactNode } from "react";
import type { z } from "zod";

/**
 * Everything a Section is handed when it renders.
 *
 * A single named object rather than a positional argument list, because ticket
 * 04 adds `content` — the Tenant-owned values read from Firestore — alongside
 * `props`. Widening one object type leaves every Section that does not read
 * content untouched; widening a parameter list would not.
 *
 * The split is the ownership boundary from the spec: `props` is
 * Platform-Operator-owned layout that lives in git with the Composition,
 * `content` is Tenant-owned and lives in Firestore.
 */
export type SectionArgs<Props, Variant> = {
  readonly props: Props;
  readonly variant: Variant;
};

/**
 * Declares one Section: its props schema, the variants it is willing to render
 * in, and the component itself.
 *
 * The helper exists purely for inference. `propsSchema` is captured as its own
 * concrete schema type rather than widened to `z.ZodType`, so a Composition
 * author gets the schema's *input* type — and `variants` is captured as a
 * literal tuple, so the registry can narrow `variant` per section type. Both
 * are lost the moment either is annotated by hand.
 *
 * Sections are Server Components. Nothing here accepts a `"use client"`
 * boundary on the Section's behalf: a Section that needs interactivity marks
 * its own module, and only that module, so the page stays free of client
 * JavaScript by default rather than by discipline.
 */
export function defineSection<const Variants extends readonly string[], Schema extends z.ZodType>(
  definition: SectionDefinition<Variants, Schema>,
): SectionDefinition<Variants, Schema> {
  return definition;
}

type SectionDefinition<Variants extends readonly string[], Schema extends z.ZodType> = {
  readonly propsSchema: Schema;
  /** Empty for a Section with a single appearance; a Composition may then give no `variant`. */
  readonly variants: Variants;
  readonly component: (args: SectionArgs<z.output<Schema>, Variants[number]>) => ReactNode;
};
