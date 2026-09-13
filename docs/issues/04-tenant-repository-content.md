# 04: `TenantRepository` and Firestore Content drives a Section

**What to build:** The words on the Site come out of Firestore instead of out of
the Composition. A Platform Operator edits a document, the Site rebuilds, and
the page says the new thing. All access runs server-side through one gateway
that cannot be pointed at another Tenant, and the browser has no path to
Firestore at all.

**Blocked by:** 03 (Section Registry and Composition).

**Status:** ready-for-agent

**Build status:** claimed

## Design and technology choices

**One Firebase project, EU region, chosen once.** The Firestore location is
immutable after creation, so pick a European multi-region or region deliberately
and record which. Getting this wrong means a new project and a data migration
for a compliance reason.

**Everything nests under `tenants/{tenantId}`.** Content, services, staff,
bookings, requests and occupancy are subcollections of the Tenant document.
Never a top-level collection with a `tenantId` field: that spreads the scoping
obligation across every query anyone writes for the rest of the project, and
one forgotten `where` clause is a cross-Tenant leak.

**Security rules are `allow read, write: if false` on every path, including
Storage.** Deployed in this ticket, not later. A deny-all rule has no
misconfiguration to make. This is the substitute for rules tests the spec calls
out, and it only works if it is total — the moment one path gets a real rule,
the guarantee is gone and you need the tests back.

**Tenant scoping is enforced by the API shape, not by discipline.** The gateway
exposes `forTenant(tenantId)` returning an object whose methods take no tenant
argument — the id is captured in the closure. A caller cannot ask for another
Tenant's data because there is no parameter through which to ask. Resolving
`tenantId` happens in exactly two places: the Site (baked env var, below) and
the admin session (ticket 11).

**Server-only, enforced by the module system.** Put `import "server-only"` at the
top of the data package entry point. Importing it from a client component then
becomes a build error rather than a runtime leak of a service account.

**Credentials from the environment, never a file in the repo.** A service account
JSON, base64-encoded into a single environment variable, decoded at init.
Initialise the Admin SDK once behind a module-level singleton guard, because a
serverless function may reuse its module scope across invocations and
re-initialising throws.

**Parse on read, always.** Firestore is schemaless and its documents will drift —
a field renamed by hand, a number stored as a string. Every read goes through the
Zod schema for that document type and a parse failure surfaces loudly. Never
`as` a snapshot's data into a type.

**Content shape mirrors the Composition, keyed by section id.** A Section's
content is looked up by the anchor id from ticket 03. Alternatives considered:
one big document per page (simple, but every edit rewrites everything and
concurrent admin edits clobber), or one document per section (more reads).
Choose one document per page area at the granularity you will let a Tenant save
independently in ticket 12 — save granularity and document granularity should
match.

**Caching and invalidation are tag-based.** Wrap reads in Next's cache with a
`tenant:{id}:content` tag. Ticket 12's webhook calls `revalidateTag` with
exactly that tag. This is what makes public traffic cause zero Firestore reads.

**The Site knows its Tenant from a build-time environment variable.** Each Site
is its own deployment, so `TENANT_ID` baked into the Vercel project is simpler
and safer than resolving from a hostname at request time — and it cannot be
spoofed by a `Host` header.

**Missing content renders a defined empty state, not a crash.** A Section whose
content document is absent should render its neutral empty state so a
half-seeded Tenant is inspectable rather than a 500.

## Acceptance criteria

- [ ] A Firebase project exists in an EU location with Firestore and Storage enabled, and the chosen location is recorded in the repo
- [ ] Firestore and Storage rules are deny-all on every path and deployed
- [ ] `TenantRepository` is the only module in the repo importing a Firestore SDK, is `server-only`, and exposes tenant-scoped accessors with no tenant parameter on their methods
- [ ] Every document read is parsed through a Zod schema; a malformed document produces a clear error naming the path and field
- [ ] Admin SDK initialisation is idempotent across warm invocations and takes its credential from an environment variable
- [ ] At least one Section renders its text from Firestore; editing the document and rebuilding changes the page
- [ ] Content reads are wrapped in a cache tagged per Tenant, and a served page triggers no Firestore read
- [ ] The Site resolves its Tenant from a build-time environment variable
- [ ] A Section with no content document renders an empty state rather than failing the page
