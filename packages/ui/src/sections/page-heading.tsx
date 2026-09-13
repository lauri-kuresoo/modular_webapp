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
 */
const propsSchema = z.object({
  eyebrow: z.string().min(1).optional(),
  heading: z.string().min(1),
  lead: z.string().min(1).optional(),
});

const ALIGNMENTS = {
  left: "text-left",
  centred: "text-center",
} as const;

export const pageHeading = defineSection({
  propsSchema,
  variants: ["left", "centred"],
  component: ({ props, variant }) => (
    <Container width="prose">
      <div className={`pt-20 pb-6 ${ALIGNMENTS[variant]}`}>
        {props.eyebrow === undefined ? null : (
          <p className="text-text-muted text-sm font-medium tracking-widest uppercase">
            {props.eyebrow}
          </p>
        )}
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {props.heading}
        </h1>
        {props.lead === undefined ? null : (
          <p className="text-text-muted mt-6 text-lg">{props.lead}</p>
        )}
      </div>
    </Container>
  ),
});
