import { z } from "zod";

/**
 * One Section's Content: the Tenant-owned values inside it, keyed by field name.
 *
 * Text is the only value kind v1 stores — images arrive with ticket 13, and
 * prices and durations live on Service documents from ticket 14, not here. A
 * number or a nested map in a Content document is therefore drift, and parsing
 * it here is what turns that drift into a named error rather than
 * `[object Object]` on a Tenant's Site.
 *
 * *Which* fields a Section reads is deliberately not knowable here: `@salon/core`
 * depends on nothing, and the field list belongs with the Section that renders
 * it. So this schema fixes the storage shape, and `@salon/ui` parses each
 * document a second time against the Section's own content schema.
 *
 * A field the Tenant cleared in ticket 12's editor arrives as `""`. Dropping it
 * on the way in means "absent" is the only empty case that exists downstream —
 * otherwise every Section, forever, has to treat a blank string and a missing
 * key alike, and the first one that forgets renders an empty heading.
 */
export const contentDocumentSchema = z
  .record(z.string(), z.string())
  .transform((document) =>
    Object.fromEntries(Object.entries(document).filter(([, value]) => value.trim() !== "")),
  );

export type SectionContent = z.output<typeof contentDocumentSchema>;

/**
 * Every Content document a Tenant has, keyed by the anchor id of the Section it
 * fills — the ids ticket 03's `defineComposition` assigns. That key is the whole
 * contract between the two halves: `@salon/data` reads documents under it,
 * `@salon/ui` looks one up per placed Section, and neither imports the other.
 */
export type TenantContent = Readonly<Record<string, SectionContent>>;
