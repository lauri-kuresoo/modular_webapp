import { z } from "zod";
import { LocaleSwitcher } from "../chrome/locale-switcher";
import { Container } from "../primitives/container";
import { defineSection } from "./define";

/**
 * Compliance and contact furniture: address, phone, email, opening-hours
 * summary, the LocaleSwitcher, and an optional privacy-notice link.
 *
 * Content-driven like every other Section. The LocaleSwitcher is the existing
 * client island from ticket 05 — colocated here so the layout does not render a
 * second one.
 */
const contentSchema = z.strictObject({
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  hours: z.string().optional(),
  privacyLabel: z.string().optional(),
});

const propsSchema = z.object({
  privacyHref: z.string().min(1).optional(),
});

export const footer = defineSection({
  propsSchema,
  contentSchema,
  variants: [],
  component: ({ props, content }) => {
    const privacy =
      content.privacyLabel === undefined || props.privacyHref === undefined ? null : (
        <a
          href={props.privacyHref}
          className="text-text-muted hover:text-accent text-sm underline underline-offset-4"
        >
          {content.privacyLabel}
        </a>
      );

    return (
      <div className="border-t border-border">
        <Container width="wide">
          <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2 text-sm">
              {content.address === undefined ? null : (
                <p className="text-text whitespace-pre-line">{content.address}</p>
              )}
              {content.phone === undefined ? null : (
                <p>
                  <a className="text-accent hover:underline" href={`tel:${content.phone.replace(/\s+/g, "")}`}>
                    {content.phone}
                  </a>
                </p>
              )}
              {content.email === undefined ? null : (
                <p>
                  <a className="text-accent hover:underline" href={`mailto:${content.email}`}>
                    {content.email}
                  </a>
                </p>
              )}
            </div>
            <div className="text-sm">
              {content.hours === undefined ? null : (
                <p className="text-text whitespace-pre-line">{content.hours}</p>
              )}
            </div>
            <div className="flex flex-col items-start gap-4 sm:items-end">
              <LocaleSwitcher />
              {privacy}
            </div>
          </div>
        </Container>
      </div>
    );
  },
});
