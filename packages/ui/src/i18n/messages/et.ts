/**
 * The platform's own UI strings in Estonian: labels, accessible names and form
 * errors that belong to the library rather than to any Tenant.
 *
 * Estonian is the source of truth, and `UiMessages` is derived from it, so a key
 * added here and not translated is a type error in `en.ts` rather than a
 * `localeSwitcher.label` rendered to a Visitor.
 *
 * A Tenant's own words never appear here. They are Content, they live in
 * Firestore and the Tenant edits them; a word in this file can only be changed
 * by a deploy.
 */
export const et = {
  localeSwitcher: {
    label: "Vali keel",
  },
  notFound: {
    title: "Lehte ei leitud",
  },
};

export type UiMessages = typeof et;
