import { z } from "zod";
import { Container } from "../primitives/container";
import { defineSection } from "./define";

/**
 * A full-width call to action. The target href is Composition-owned so the
 * Platform Operator can point it at booking, contact or an anchor without
 * editing Tenant Content. Heading policy: `<h2>`.
 */
const contentSchema = z.strictObject({
  heading: z.string().optional(),
  body: z.string().optional(),
  ctaLabel: z.string().optional(),
});

const propsSchema = z.object({
  ctaHref: z.string().min(1),
});

const CTA_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 " +
  "bg-accent text-accent-contrast shadow-sm hover:shadow-md " +
  "font-body text-base leading-none font-medium transition " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export const ctaBand = defineSection({
  propsSchema,
  contentSchema,
  variants: [],
  component: ({ props, content }) => {
    if (content.heading === undefined && content.ctaLabel === undefined) return null;
    return (
      <div className="bg-surface-raised border-y border-border">
        <Container width="content">
          <div className="flex flex-col items-start justify-between gap-8 py-14 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              {content.heading === undefined ? null : (
                <h2 className="font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                  {content.heading}
                </h2>
              )}
              {content.body === undefined ? null : (
                <p className="text-text-muted mt-3 text-base">{content.body}</p>
              )}
            </div>
            {content.ctaLabel === undefined ? null : (
              <a href={props.ctaHref} className={CTA_CLASS}>
                {content.ctaLabel}
              </a>
            )}
          </div>
        </Container>
      </div>
    );
  },
});
