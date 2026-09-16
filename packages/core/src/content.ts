import { z } from "zod";
import { DEFAULT_LOCALE, localeSchema, type Locale } from "./locale";

/**
 * The optional locales are listed by hand because the required/optional split is
 * exactly what the type has to express, and no construction driven by `LOCALES`
 * produces `{ et: string; en?: string }` statically. The `satisfies` is the link
 * back: adding a locale to `LOCALES` without adding it here is a type error.
 */
const localizedTextSchema = z.object({
  et: z.string(),
  en: z.string().optional(),
} satisfies Record<Locale, z.ZodType>);

/**
 * One Tenant-authored text in each locale it has been written in.
 *
 * Estonian is required and every other locale optional, so the fallback chain
 * `requested → Estonian` always terminates in a real string. That guarantee is
 * encoded in the type rather than in a runtime default because a type cannot be
 * forgotten: there is no way to hold a `LocalizedText` and not have Estonian.
 *
 * Not exported: `SectionContent` is the shape the platform passes around, and
 * the one caller that will want to name a single field is ticket 12's editor.
 */
type LocalizedText = z.output<typeof localizedTextSchema>;

/**
 * What a per-locale field has to look like in Firestore, quoted in the parse
 * error because that error is all an Operator staring at a failed build has to
 * work from.
 *
 * It replaces Zod's message only for `invalid_type` — the "this is not a map at
 * all" case, which is the flat-string document shape this ticket replaced. Every
 * other issue keeps Zod's own wording, which is more specific than this is
 * ("Unrecognized key: \"ru\"" beats being told the shape again).
 */
const FIELD_SHAPE = 'a map from locale to text, such as { et: "Tere", en: "Hello" }';

/**
 * One Section's Content: the Tenant-owned values inside it, keyed by field name,
 * each of them localised.
 *
 * Text is the only value kind v1 stores — images arrive with ticket 13, and
 * prices and durations live on Service documents from ticket 14, not here. A
 * number or a bare string in a Content document is therefore drift, and parsing
 * it here is what turns that drift into a named error rather than
 * `[object Object]` on a Tenant's Site.
 *
 * *Which* fields a Section reads is deliberately not knowable here: `@salon/core`
 * depends on nothing, and the field list belongs with the Section that renders
 * it. So this schema fixes the storage shape, and `@salon/ui` resolves each
 * document to the active locale and parses it a second time against the
 * Section's own content schema.
 *
 * The parse runs in three steps, because the empty case has to be settled before
 * the Estonian requirement is applied:
 *
 * 1. the shape check, which rejects an unknown locale key and anything that is
 *    not a per-locale map — including the flat `field: "text"` documents that
 *    predate ticket 05;
 * 2. `dropEmptyTranslations`, because a field the Tenant cleared in ticket 12's
 *    editor arrives as `""`. Dropping empties on the way in means "absent" is the
 *    only empty case that exists downstream, which is what makes an emptied
 *    English field fall back to Estonian rather than render a blank;
 * 3. the re-parse, which is what requires Estonian. Last, so that a field
 *    carrying English and no Estonian is a loud error naming the field, while a
 *    field the Tenant cleared in every locale had already disappeared in step 2.
 */
export const contentDocumentSchema = z
  .record(
    z.string(),
    z.partialRecord(localeSchema, z.string(), {
      error: (issue) => (issue.code === "invalid_type" ? FIELD_SHAPE : undefined),
    }),
  )
  .transform(dropEmptyTranslations)
  .pipe(z.record(z.string(), localizedTextSchema));

export type SectionContent = z.output<typeof contentDocumentSchema>;

/**
 * Every Content document a Tenant has, keyed by the anchor id of the Section it
 * fills — the ids ticket 03's `defineComposition` assigns. That key is the whole
 * contract between the two halves: `@salon/data` reads documents under it,
 * `@salon/ui` looks one up per placed Section, and neither imports the other.
 */
export type TenantContent = Readonly<Record<string, SectionContent>>;

/** A field as stored, before Estonian has been required of it. */
type StoredTranslations = Partial<Record<Locale, string>>;

function dropEmptyTranslations(
  document: Record<string, StoredTranslations>,
): Record<string, StoredTranslations> {
  return Object.fromEntries(
    Object.entries(document)
      .map(([field, translations]) => [field, withoutEmptyTranslations(translations)] as const)
      .filter(([, translations]) => Object.keys(translations).length > 0),
  );
}

function withoutEmptyTranslations(translations: StoredTranslations): StoredTranslations {
  return Object.fromEntries(Object.entries(translations).filter(([, text]) => text.trim() !== ""));
}

/**
 * The one place a locale is chosen for a Tenant's words.
 *
 * A whole document at a time rather than a field at a time, so that a Section is
 * handed plain strings and never sees the locale map at all. A Section therefore
 * cannot render a blank by indexing the map itself or by forgetting to resolve —
 * it has nothing to forget.
 */
export function resolveContent(
  content: SectionContent,
  locale: Locale,
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    Object.entries(content).map(([field, text]) => [field, resolveText(text, locale)] as const),
  );
}

/**
 * The fallback chain itself, written once: the locale asked for, then Estonian.
 * It returns a `string` rather than `string | undefined` only because
 * `DEFAULT_LOCALE` keeps its literal type, so the compiler can see that a
 * `LocalizedText` has that key.
 */
function resolveText(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text[DEFAULT_LOCALE];
}

/**
 * The fields of one Content document that carry no text in `locale` and would
 * therefore render their Estonian fallback.
 *
 * Driven by the document rather than by a field list, so it stays correct as
 * Sections gain fields. Ticket 12's editor is what renders this beside the
 * fields it names; nothing on a Site reads it, because a Visitor is shown the
 * fallback rather than told about it.
 */
export function untranslatedFields(content: SectionContent, locale: Locale): readonly string[] {
  return Object.entries(content)
    .filter(([, text]) => text[locale] === undefined)
    .map(([field]) => field);
}
