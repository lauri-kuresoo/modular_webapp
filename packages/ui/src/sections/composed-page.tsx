import { resolveContent, type Locale, type SectionContent, type TenantContent } from "@salon/core";
import type { ReactNode } from "react";
import { z } from "zod";
import { NAVBAR_SCROLL_SENTINEL_ID } from "../chrome/navbar-scroll";
import type { Composition } from "./composition";
import type { SectionArgs } from "./define";
import { CHROME_SECTION_TYPES, SECTION_REGISTRY, type SectionType } from "./registry";

/**
 * A Site's page, rendered by folding its Composition against the Section
 * Registry. There is no switch on section type here and no roster of Sections —
 * reordering or re-parameterising a page is an edit to the Composition alone.
 *
 * Landmarks are assigned here so a Section cannot forget them: Navbar →
 * `<header>`, Footer → `<footer>`, everything else → `<section>` inside one
 * `<main id="main">`. Vertical rhythm stays with the Section.
 *
 * Navbar transparency is derived here too. If the first non-chrome Section is a
 * Hero, the Navbar receives `overHero: true` regardless of the Composition's
 * declared variant; with no leading Hero, a declared `transparent-over-hero`
 * falls back to `solid` so light text cannot land on a light background.
 *
 * `content` is required rather than defaulted. A page that renders without it
 * would be a Site quietly serving none of its Tenant's words, and the whole
 * point of the prop is that the app layer — the only layer allowed to touch
 * `@salon/data` — is the one that fetched it.
 *
 * `locale` is a prop rather than something read from `next-intl`'s server
 * context, so this stays a pure function of its arguments.
 */
export function ComposedPage({
  composition,
  content,
  locale,
}: {
  composition: Composition;
  content: TenantContent;
  locale: Locale;
}) {
  const overHero = hasLeadingHero(composition);
  const navbar = composition.filter((section) => section.type === "navbar");
  const footerSections = composition.filter((section) => section.type === "footer");
  const body = composition.filter(
    (section) => section.type !== "navbar" && section.type !== "footer",
  );

  return (
    <>
      {navbar.map((section) => (
        <header key={section.id} id={section.id}>
          {renderSection(section, content[section.id], locale, overHero)}
        </header>
      ))}
      <main id="main">
        {body.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            className={section.type === "hero" && overHero && index === 0 ? "relative" : undefined}
          >
            {section.type === "hero" && overHero && index === 0 ? (
              <div
                id={NAVBAR_SCROLL_SENTINEL_ID}
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-0 h-px w-px"
              />
            ) : null}
            {renderSection(section, content[section.id], locale, overHero)}
          </section>
        ))}
      </main>
      {footerSections.map((section) => (
        <footer key={section.id} id={section.id}>
          {renderSection(section, content[section.id], locale, overHero)}
        </footer>
      ))}
    </>
  );
}

function hasLeadingHero(composition: Composition): boolean {
  const leading = composition.find((section) => !isChrome(section.type));
  return leading?.type === "hero";
}

function isChrome(type: SectionType): boolean {
  return (CHROME_SECTION_TYPES as readonly string[]).includes(type);
}

function renderSection(
  section: Composition[number],
  stored: SectionContent | undefined,
  locale: Locale,
  overHero: boolean,
): ReactNode {
  const { component, contentSchema } = SECTION_REGISTRY[section.type];
  /*
   * `defineComposition` is what makes this assertion sound: `props` is whatever
   * this entry's own `propsSchema` produced and `variant` is one it declared.
   * TypeScript has no way to say "some Props, the same on both sides of the
   * registry lookup", so the pairing is asserted once, here, rather than every
   * Section having to re-establish it.
   */
  const render = component as (
    args: SectionArgs<unknown, string | undefined, unknown>,
  ) => ReactNode;
  return render({
    props: resolveProps(section, overHero),
    variant: resolveVariant(section, overHero),
    content: parseContent(contentSchema, stored, locale, section.id),
  });
}

/**
 * Navbar transparency is derived from the Composition's leading Hero, not from
 * an independent prop the author could desync. Other Sections keep the props
 * `defineComposition` already validated.
 */
function resolveProps(section: Composition[number], overHero: boolean): unknown {
  if (section.type !== "navbar") return section.props;
  return { ...(section.props as Record<string, unknown>), overHero };
}

/**
 * Without a leading Hero, a Composition that asked for `transparent-over-hero`
 * is corrected to `solid`. With a leading Hero the declared layout variant is
 * kept (`centred-logo` stays centred) and transparency arrives via `overHero`.
 */
function resolveVariant(
  section: Composition[number],
  overHero: boolean,
): string | undefined {
  if (section.type !== "navbar") return section.variant;
  if (!overHero && section.variant === "transparent-over-hero") return "solid";
  if (overHero && section.variant === "transparent-over-hero") return "solid";
  return section.variant;
}

function parseContent(
  contentSchema: z.ZodType,
  stored: SectionContent | undefined,
  locale: Locale,
  anchorId: string,
): unknown {
  const content = contentSchema.safeParse(resolveContent(stored ?? {}, locale));
  if (!content.success) {
    throw new Error(
      `Content for Section "${anchorId}" does not match what that Section reads.\n` +
        z.prettifyError(content.error),
    );
  }
  return content.data;
}
