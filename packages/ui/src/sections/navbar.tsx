import { z } from "zod";
import { MobileNav } from "../chrome/mobile-nav";
import { NavbarChrome } from "../chrome/navbar-scroll";
import { Container } from "../primitives/container";
import { defineSection } from "./define";

/**
 * Site chrome: brand, in-page links, and a mobile menu.
 *
 * Three visual variants are registered — `transparent-over-hero`, `solid`,
 * `centred-logo`. Transparency is not an independent Composition knob:
 * `ComposedPage` derives it from a leading Hero and injects `overHero` at
 * render time, falling back to solid when there is none, so the bar cannot
 * desync into light text on a light background. A Composition that asks for
 * `transparent-over-hero` without a leading Hero is corrected to `solid` by
 * the fold.
 *
 * Client JavaScript is limited to scroll state (IntersectionObserver) and the
 * mobile `<dialog>` menu. Link labels and the brand are Tenant Content.
 */
const LABEL_FIELDS = ["home", "about", "services", "contact", "book"] as const;

const propsSchema = z.object({
  links: z
    .array(
      z.object({
        href: z.string().min(1),
        labelField: z.enum(LABEL_FIELDS),
      }),
    )
    .default([]),
  /** Platform UI strings — passed from the Site so this Section never imports next-intl. */
  menuOpenLabel: z.string().min(1),
  menuCloseLabel: z.string().min(1),
  /** Accessible name when brand content is absent — platform UI string, not Tenant. */
  homeLabel: z.string().min(1),
  /**
   * Injected by `ComposedPage` from the Composition's leading Section — not a
   * Composition authoring prop. Optional so a half-written Composition still
   * parses; absent means solid.
   */
  overHero: z.boolean().optional(),
});

const contentSchema = z.strictObject({
  brand: z.string().optional(),
  home: z.string().optional(),
  about: z.string().optional(),
  services: z.string().optional(),
  contact: z.string().optional(),
  book: z.string().optional(),
});

const LINK_CLASS =
  "rounded-md px-3 py-2 text-sm font-medium text-current " +
  "hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export const navbar = defineSection({
  propsSchema,
  contentSchema,
  variants: ["solid", "centred-logo", "transparent-over-hero"],
  component: ({ props, variant, content }) => {
    const overHero = props.overHero === true;
    const centred = variant === "centred-logo";
    const links = props.links.flatMap((link) => {
      const label = content[link.labelField];
      return label === undefined ? [] : [{ href: link.href, label }];
    });
    const brand = content.brand;

    const linkElements = links.map((link) => (
      <a key={link.href} href={link.href} className={LINK_CLASS}>
        {link.label}
      </a>
    ));

    const brandEl =
      brand === undefined ? (
        <span className="sr-only">{props.homeLabel}</span>
      ) : (
        <a href="#main" className="font-display text-lg font-semibold tracking-tight text-current">
          {brand}
        </a>
      );

    return (
      <NavbarChrome overHero={overHero}>
        <Container width="wide">
          {centred ? (
            <div className="relative flex h-16 items-center justify-center">
              <nav className="absolute left-0 hidden items-center gap-1 md:flex" aria-label={props.menuOpenLabel}>{linkElements}</nav>
              {brandEl}
              <div className="absolute right-0">
                <MobileNav openLabel={props.menuOpenLabel} closeLabel={props.menuCloseLabel}>
                  {linkElements}
                </MobileNav>
              </div>
            </div>
          ) : (
            <div className="flex h-16 items-center justify-between gap-4">
              {brandEl}
              <nav className="hidden items-center gap-1 md:flex" aria-label={props.menuOpenLabel}>
                {linkElements}
              </nav>
              <MobileNav openLabel={props.menuOpenLabel} closeLabel={props.menuCloseLabel}>
                {linkElements}
              </MobileNav>
            </div>
          )}
        </Container>
      </NavbarChrome>
    );
  },
});
