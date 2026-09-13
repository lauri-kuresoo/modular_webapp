import type { ReactNode } from "react";
import type { SectionArgs } from "./define";
import type { Composition } from "./composition";
import { SECTION_REGISTRY } from "./registry";

/**
 * A Site's page, rendered by folding its Composition against the Section
 * Registry. There is no switch on section type here and no list of Sections —
 * reordering or re-parameterising a page is an edit to the Composition alone.
 *
 * Each Section is wrapped in a `<section>` carrying its anchor id. That wrapper
 * lives here, not in the Sections, so a Section cannot be written without one.
 * Vertical rhythm deliberately stays with the Section: a full-bleed Hero and a
 * run of paragraphs do not share one, and a padded wrapper would leave ticket 06
 * cancelling it out.
 */
export function ComposedPage({ composition }: { composition: Composition }) {
  return (
    <>
      {composition.map((section) => (
        <section key={section.id} id={section.id}>
          {renderSection(section)}
        </section>
      ))}
    </>
  );
}

function renderSection(section: Composition[number]): ReactNode {
  const { component } = SECTION_REGISTRY[section.type];
  /*
   * `defineComposition` is what makes this assertion sound: `props` is whatever
   * this entry's own `propsSchema` produced and `variant` is one it declared.
   * TypeScript has no way to say "some Props, the same on both sides of the
   * registry lookup", so the pairing is asserted once, here, rather than every
   * Section having to re-establish it.
   */
  const render = component as (args: SectionArgs<unknown, string | undefined>) => ReactNode;
  return render({ props: section.props, variant: section.variant });
}
