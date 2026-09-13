import type { z } from "zod";
import { pageHeading } from "./page-heading";
import { proseBlock } from "./prose-block";

/**
 * The Section Registry: every Section the platform can render, keyed by the
 * `type` string a Composition uses.
 *
 * This object is the *only* enumeration of section types in the repo. There is
 * no hand-maintained union beside it and no switch statement in the renderer —
 * everything below is derived from it, so a new entry is immediately visible to
 * the type checker, to Composition autocomplete and to the fold. Adding a
 * Section to the platform is one line here plus the component's own module.
 */
export const SECTION_REGISTRY = {
  "page-heading": pageHeading,
  "prose-block": proseBlock,
} as const;

type Registry = typeof SECTION_REGISTRY;

export type SectionType = keyof Registry;

/**
 * One entry in a Composition, narrowed to a single section type: the props that
 * type's schema accepts, and — only when it declares any — one of its variants.
 *
 * `variant` is required rather than defaulted. A default would have to be
 * chosen somewhere, and "the Composition did not say" and "the Composition
 * asked for the first variant" would then be indistinguishable at the point
 * where a Section renders the wrong thing.
 */
type CompositionEntryFor<T extends SectionType> = {
  readonly type: T;
  /** Overrides the derived anchor id. Lowercase, digits and hyphens; unique across the page. */
  readonly id?: string;
  readonly props: z.input<Registry[T]["propsSchema"]>;
} & ([Registry[T]["variants"][number]] extends [never]
  ? // Intersecting `unknown` is erased, so a Section with no variants has no
    // `variant` key at all. Writing `variant?: never` instead would also reject
    // one, but with an error quoting some *other* Section's variant list.
    unknown
  : { readonly variant: Registry[T]["variants"][number] });

/**
 * A discriminated union over every registered type, which is what gives the
 * Platform Operator autocomplete on `type` and then narrowed autocomplete on
 * `variant` and `props` for the type they picked.
 */
export type CompositionEntry = { [T in SectionType]: CompositionEntryFor<T> }[SectionType];
