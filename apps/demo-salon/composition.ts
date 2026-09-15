import { defineComposition } from "@salon/ui";
import { THEME_PRESETS } from "@salon/theme";
import { SITE_THEME } from "./site.config";

const preset = THEME_PRESETS[SITE_THEME];

/**
 * This Site's page, as configuration.
 *
 * The page is assembled from registered Sections rather than written: reordering
 * these entries reorders the page, and changing a `props` value re-shapes it,
 * without touching a component. `defineComposition` parses the list against the
 * Section Registry as this module loads, so a bad `type`, `variant` or props
 * object fails `next build`.
 *
 * Owned by the Platform Operator and versioned in git. The Tenant's own words
 * are not here: each entry's anchor id — `page-heading` for the first one — is
 * the id of its document under `tenants/{tenantId}/content`, which is where its
 * text is read from and where ticket 12's editor writes.
 */
export const HOME_COMPOSITION = defineComposition([
  {
    type: "page-heading",
    variant: "left",
    props: {},
  },
  {
    type: "prose-block",
    props: {
      paragraphs: [
        "This page is assembled from registered Sections rather than written by hand, and it is generated at build time, so it loads on mobile data before a visitor gives up.",
        `It is rendering in the ${preset.label} Theme, which follows your operating system’s light or dark preference. Every colour, radius, font and spacing step comes from that Theme; no Section here knows which one is active.`,
      ],
    },
  },
]);
