import { defineComposition } from "@salon/ui";

/**
 * This Site's page, as configuration.
 *
 * Owned by the Platform Operator and versioned in git. The Tenant's own words
 * are not here: each entry's anchor id is the id of its document under
 * `tenants/{tenantId}/content`. Navbar transparency is derived by the fold from
 * the leading Hero — the Composition asks for `solid` and gets transparent
 * paint because `hero` is the first body Section.
 *
 * Menu labels are platform UI strings, passed through props so `@salon/ui`
 * Sections never import `next-intl` themselves. The Site layout resolves the
 * active locale's dictionary and hands the strings in.
 */
export function homeComposition(menu: { open: string; close: string }) {
  return defineComposition([
    {
      type: "navbar",
      variant: "solid",
      props: {
        menuOpenLabel: menu.open,
        menuCloseLabel: menu.close,
        links: [
          { href: "#about", labelField: "about" },
          { href: "#cta-band", labelField: "book" },
          { href: "#footer", labelField: "contact" },
        ],
      },
    },
    {
      type: "hero",
      variant: "image",
      props: { ctaHref: "#cta-band" },
    },
    {
      type: "about",
      props: {},
    },
    {
      type: "cta-band",
      props: { ctaHref: "#footer" },
    },
    {
      type: "footer",
      props: { privacyHref: "/privacy" },
    },
  ]);
}
