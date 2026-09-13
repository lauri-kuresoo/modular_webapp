import { z } from "zod";

/**
 * One Section's Content document: the Tenant-owned values inside that Section,
 * keyed by field name.
 *
 * Text is the only value kind v1 stores — images arrive with ticket 13 and
 * prices with ticket 14, and each widens this schema rather than going around
 * it. Keeping the stored shape flat is what lets `@salon/data` reject a drifted
 * document (a number typed into a field by hand, a nested map) without knowing
 * anything about Sections.
 *
 * Unrecognised keys are deliberately *not* an error. A field dropped from a
 * Section's schema leaves its value behind in Firestore, and a stale key must
 * not take a Tenant's Site down; the Section's own schema decides which keys it
 * reads.
 */
export const contentDocumentSchema = z.record(z.string(), z.string());

export type SectionContent = z.infer<typeof contentDocumentSchema>;

/**
 * Every Content document a Tenant has, keyed by the anchor id of the Section it
 * fills.
 *
 * This is the whole vocabulary `@salon/data` and `@salon/ui` share about
 * Content: one reads it, the other folds it over a Composition, and neither
 * imports the other.
 */
export type TenantContent = Readonly<Record<string, SectionContent>>;
