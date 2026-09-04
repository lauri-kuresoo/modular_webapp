# 12: Tenant edits its own words and sees them live within seconds

**What to build:** A Tenant logs in, fixes a typo in their own copy, saves, and
the public Site shows the change seconds later without anybody deploying
anything. They can switch to English in the editor and see plainly which fields
they have not translated yet.

**Blocked by:** 11 (Admin shell), 05 (i18n).

**Status:** ready-for-agent

## Design and technology choices

**The editing form is generated from the content schema, not hand-built per
field.** One Zod schema per content document already drives validation and
types from ticket 04; annotate it with field metadata (label key, control kind,
max length, help text) and render the form from that. The alternative — a
bespoke form per Section — guarantees that the twelfth Section's editor is
missing a field somebody added to the schema, and there is no test to catch it.

**Control kinds are deliberately few: short text, long text, number, image,
list.** No rich text editor in v1. Rich text means storing markup, which means
sanitising it on the way out, which means an XSS surface in a product whose
entire security posture rests on being boring. If a Tenant needs a bold word,
that is a Section variant, not a WYSIWYG.

**Save granularity matches document granularity.** Each content document is its
own form with its own save — no single giant page-wide form. Two reasons: a
Tenant editing on a phone should not have to submit thirty fields to fix one,
and a smaller write is a smaller clobber window if they have the admin open in
two tabs.

**Server actions with a shared schema, and optimistic UI.** The same schema
validates in the browser for instant feedback and on the server for real. Show
the pending state, and on failure keep the user's text in the field — losing a
paragraph of typing to a network blip is the single most infuriating thing a
CMS can do.

**Publishing is a webhook call, authenticated by HMAC.** After a successful
write, the admin calls the Site's revalidate URL, both stored on the Tenant
document alongside a shared secret. The request body is signed with
HMAC-SHA256 using that secret; the Site's route handler recomputes the signature
in constant time before doing anything. A bearer secret in a query string ends
up in Vercel's request logs; a body signature does not. The handler then calls
`revalidateTag` with the Tenant tag from ticket 04 — it does not rebuild, so
"live within seconds" is honest.

**Record the publish outcome on the Tenant document.** `lastPublishAt`,
`lastPublishStatus` and the failure reason if any. Ticket 25's Ops Console reads
exactly these fields to spot a broken publish pipeline, and the Tenant sees
"published" or "publish failed, retry" rather than a silent success that did not
reach the Site.

**Publishing is retryable and idempotent.** If the write succeeds and the webhook
fails, the content is saved and the Site is stale. Show that state explicitly
with a retry button rather than pretending the save failed — the two outcomes
need different remedies and conflating them makes the Tenant re-type their text.

**Untranslated fields are flagged from the ticket 05 helper**, not from logic
written here. A locale toggle in the editor switches which locale's values you
are editing, with the Estonian value shown as ghosted placeholder text in the
English field so the Tenant can see what they are translating. Show a per-Section
count of missing translations so the work is findable without hunting.

**Every content document records who edited it and when.** Needed by the Ops
Console, and it is the only audit trail the platform will have.

**A preview link, not a preview mode.** Draft state, preview tokens and
scheduled publishing are all out of scope; after publishing, link the Tenant
straight to the affected public page so they can confirm with their own eyes.

## Acceptance criteria

- [ ] The editor form is generated from the annotated content schema; adding a field to a schema makes it editable with no form code change
- [ ] Available controls are short text, long text, number, image and list only; no rich text is stored or rendered anywhere
- [ ] Each content document saves independently; no page-wide submit
- [ ] Validation runs from one shared schema on both client and server, and a failed save preserves the Tenant's input
- [ ] A successful save calls the Site's revalidate webhook with an HMAC-signed body; the Site verifies the signature in constant time and rejects an unsigned or mis-signed request
- [ ] The webhook revalidates by Tenant tag rather than triggering a rebuild, and the public page reflects the edit within seconds
- [ ] `lastPublishAt` and `lastPublishStatus` (with failure reason) are written to the Tenant document on every attempt
- [ ] A saved-but-unpublished state is shown distinctly from a failed save, with a retry that does not require re-entering content
- [ ] A locale toggle switches the editing locale, ghosting the Estonian value behind an empty English field
- [ ] Missing translations are flagged per field and counted per Section, using the shared helper from ticket 05
- [ ] Content documents record last editor and timestamp
- [ ] After publishing, the Tenant is offered a direct link to the affected public page
