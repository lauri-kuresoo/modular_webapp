import { z } from "zod";
import { SECTION_REGISTRY, type CompositionEntry, type SectionType } from "./registry";

/** A Section as placed on a page: its parsed props, and the anchor id it renders under. */
type PlacedSection = {
  readonly id: string;
  readonly type: SectionType;
  readonly variant: string | undefined;
  /**
   * Erased, because the registry is heterogeneous. `ComposedPage` restores the
   * concrete type by looking the entry back up; nothing else should read this.
   */
  readonly props: unknown;
};

/** The ordered list of Sections that makes up a Site's page. */
export type Composition = readonly PlacedSection[];

/**
 * Parses a Site's Composition against the Section Registry and fixes each
 * Section's anchor id.
 *
 * Called at module scope, so an unknown `type`, an undeclared `variant` or props
 * that fail their schema throw during `next build` rather than rendering a
 * broken page. With no tests in this project, that build-time throw is the only
 * mechanism standing between a malformed Composition and a Tenant, so nothing
 * here is ever skipped, defaulted or warned about — it throws.
 *
 * The compile-time types make most of this unreachable from hand-written
 * TypeScript. It is checked anyway: the types vanish at a cast or an `any`, and
 * ticket 12 puts a Composition within reach of data the compiler never saw.
 */
export function defineComposition(entries: readonly CompositionEntry[]): Composition {
  return assignAnchorIds(entries.map(parseEntry));
}

type ParsedEntry = {
  readonly type: SectionType;
  readonly variant: string | undefined;
  readonly props: unknown;
  /** The Composition's explicit `id`, if it gave one. */
  readonly id: string | undefined;
};

function parseEntry(entry: CompositionEntry, index: number): ParsedEntry {
  if (!Object.hasOwn(SECTION_REGISTRY, entry.type)) {
    throw new Error(
      `Composition entry ${index}: unknown section type "${entry.type}". ` +
        `Registered types: ${Object.keys(SECTION_REGISTRY).join(", ")}.`,
    );
  }

  const definition = SECTION_REGISTRY[entry.type];
  const label = entryLabel(index, entry.type);

  return {
    type: entry.type,
    variant: parseVariant(definition.variants, variantOf(entry), label),
    props: parseProps(definition.propsSchema, entry.props, label),
    id: entry.id,
  };
}

/** A Section with no declared variants has no `variant` key on its entry type at all. */
function variantOf(entry: CompositionEntry): string | undefined {
  return "variant" in entry ? entry.variant : undefined;
}

function parseVariant(
  declared: readonly string[],
  variant: string | undefined,
  label: string,
): string | undefined {
  if (declared.length === 0) {
    if (variant !== undefined) {
      throw new Error(`${label}: declares no variants, but variant "${variant}" was given.`);
    }
    return undefined;
  }
  if (variant === undefined) {
    throw new Error(`${label}: variant is required. Declared variants: ${declared.join(", ")}.`);
  }
  if (!declared.includes(variant)) {
    throw new Error(
      `${label}: variant "${variant}" is not declared by this Section. ` +
        `Declared variants: ${declared.join(", ")}.`,
    );
  }
  return variant;
}

function parseProps(schema: z.ZodType, props: unknown, label: string): unknown {
  const result = schema.safeParse(props);
  if (!result.success) {
    throw new Error(`${label}: props do not match the Section's schema.
${z.prettifyError(result.error)}`);
  }
  return result.data;
}

/**
 * A URL fragment, so that ticket 06's navigation and skip links have something
 * to point at, and so ticket 04 can key a Section's Content by it.
 */
const ANCHOR_ID = /^[a-z][a-z0-9-]*$/;

/**
 * Anchor ids are assigned here rather than rendered by each Section, because a
 * Section that forgot one would break navigation silently and only for the page
 * it was placed on.
 *
 * The derived id is the section type for that type's first appearance and
 * `type-2`, `type-3` after it — so the common one-per-page case anchors at a
 * readable `#page-heading`. The suffix counts every appearance of the type,
 * including ones given an explicit `id`, so renaming one Section never shifts
 * another's derived id.
 */
function assignAnchorIds(entries: readonly ParsedEntry[]): Composition {
  const appearances = new Map<SectionType, number>();
  const claimedBy = new Map<string, number>();

  return entries.map((entry, index) => {
    const appearance = (appearances.get(entry.type) ?? 0) + 1;
    appearances.set(entry.type, appearance);

    const id = entry.id ?? (appearance === 1 ? entry.type : `${entry.type}-${appearance}`);
    const label = entryLabel(index, entry.type);

    if (!ANCHOR_ID.test(id)) {
      throw new Error(
        `${label}: anchor id "${id}" is not a usable URL fragment — ` +
          `use a-z, 0-9 and hyphens, starting with a letter.`,
      );
    }
    const claimant = claimedBy.get(id);
    if (claimant !== undefined) {
      throw new Error(
        `${label}: anchor id "${id}" is already used by composition entry ${claimant}.`,
      );
    }
    claimedBy.set(id, index);

    return { id, type: entry.type, variant: entry.variant, props: entry.props };
  });
}

function entryLabel(index: number, type: SectionType): string {
  return `Composition entry ${index} (${type})`;
}
