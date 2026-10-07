import { z } from "zod";
import { Container } from "../primitives/container";
import { defineSection } from "./define";

/**
 * A short introduction to the business. Heading policy: `<h2>` — the page's
 * single `<h1>` belongs to the Hero.
 */
const contentSchema = z.strictObject({
  heading: z.string().optional(),
  body: z.string().optional(),
});

export const about = defineSection({
  propsSchema: z.object({}),
  contentSchema,
  variants: [],
  component: ({ content }) => {
    if (content.heading === undefined && content.body === undefined) return null;
    return (
      <Container width="prose">
        <div className="py-16 sm:py-20">
          {content.heading === undefined ? null : (
            <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {content.heading}
            </h2>
          )}
          {content.body === undefined ? null : (
            <p className="text-text-muted mt-6 text-lg">{content.body}</p>
          )}
        </div>
      </Container>
    );
  },
});
