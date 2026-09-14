import { z } from "zod";
import { Container } from "../primitives/container";
import { defineSection } from "./define";

/**
 * A run of body paragraphs. The second of the two thin Sections that exercise
 * the fold, and the one that declares no variants — a Composition placing it
 * gives no `variant` at all, rather than a `"default"` nobody chose.
 *
 * Its words stay Composition-owned for now: they are an array of paragraphs,
 * and a Content value is a single text in v1, so there is nowhere to store them
 * yet. Ticket 12 gives the Tenant an editor for an array of texts and this
 * Section moves then. Until it does it is also the one Section here that reads
 * no Content — the case `SectionArgs` is shaped to leave alone.
 */
const propsSchema = z.object({
  paragraphs: z.array(z.string().min(1)).min(1),
});

export const proseBlock = defineSection({
  propsSchema,
  contentSchema: z.object({}),
  variants: [],
  component: ({ props }) => (
    <Container width="prose">
      <div className="pb-12">
        {props.paragraphs.map((paragraph, index) => (
          <p key={index} className="text-text-muted mt-4 text-lg first:mt-0">
            {paragraph}
          </p>
        ))}
      </div>
    </Container>
  ),
});
