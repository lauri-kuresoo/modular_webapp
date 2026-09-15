import { z } from "zod";
import { Container } from "../primitives/container";
import { defineSection } from "./define";

/**
 * The page's title: an optional eyebrow, the `<h1>`, an optional lead.
 *
 * One of the two deliberately thin Sections that exist to exercise the fold —
 * the real Sections arrive in tickets 06–08. Kept thin on purpose: designing
 * the registry around a Hero's needs would bake one Section's shape into the
 * platform.
 *
 * Every word it renders is the Tenant's, so every word is Content. What is left
 * for the Composition to own is the alignment, and that is the variant — hence
 * an empty props schema rather than an invented knob.
 */
const contentSchema = z.strictObject({
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  lead: z.string().optional(),
});

const ALIGNMENTS = {
  left: "text-left",
  centred: "text-center",
} as const;

export const pageHeading = defineSection({
  propsSchema: z.object({}),
  contentSchema,
  variants: ["left", "centred"],
  /**
   * The empty state renders nothing, and that is the decision rather than an
   * omission. A Site is public from the moment it deploys, so placeholder copy
   * for an unseeded Tenant would be placeholder copy shown to visitors; an
   * eyebrow or a lead with no heading above them is a caption for something that
   * is not there; and an `<h1>` with no text announces worse to a screen reader
   * than no heading does. `ComposedPage` still emits this Section's anchor
   * `<section>`, so a half-seeded Tenant is inspectable rather than a 500.
   */
  component: ({ variant, content }) =>
    content.heading === undefined ? null : (
      <Container width="prose">
        <div className={`pt-20 pb-6 ${ALIGNMENTS[variant]}`}>
          {content.eyebrow === undefined ? null : (
            <p className="text-text-muted text-sm font-medium tracking-widest uppercase">
              {content.eyebrow}
            </p>
          )}
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {content.heading}
          </h1>
          {content.lead === undefined ? null : (
            <p className="text-text-muted mt-6 text-lg">{content.lead}</p>
          )}
        </div>
      </Container>
    ),
});
