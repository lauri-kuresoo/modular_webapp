import { defineComposition } from "@salon/ui";
import { THEME_PRESETS } from "@salon/theme";
import { SITE_THEME } from "./site.config";

const preset = THEME_PRESETS[SITE_THEME];

/**
 * This Site's page, as configuration.
 *
 * The page is assembled from registered Sections rather than written: reordering
 * these entries reorders the page, and changing a `props` value re-words it,
 * without touching a component. `defineComposition` parses the list against the
 * Section Registry as this module loads, so a bad `type`, `variant` or props
 * object fails `next build`.
 *
 * Owned by the Platform Operator and versioned in git. The Tenant's own words
 * move out of `props` and into Firestore Content in ticket 04.
 */
export const HOME_COMPOSITION = defineComposition([
  {
    type: "page-heading",
    variant: "left",
    props: {
      eyebrow: "Demo Salon",
      heading: "A salon website that its owner can actually keep up to date.",
      lead: `This is the reference Site for the modular salon platform. It is assembled from registered Sections rather than written by hand, and it is statically generated, so it loads on mobile data before a visitor gives up. It renders in the ${preset.label} Theme, which follows your operating system's light or dark preference.`,
    },
  },
]);
