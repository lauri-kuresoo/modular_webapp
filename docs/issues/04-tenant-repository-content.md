# 04: `TenantRepository` and Firestore Content drives a Section

**What to build:** The words on the Site come out of Firestore instead of out of
the Composition. A Platform Operator edits a document, the Site rebuilds, and
the page says the new thing. All access runs server-side through one gateway
that cannot be pointed at another Tenant, and the browser has no path to
Firestore at all.

**Blocked by:** 03 (Section Registry and Composition).

**Status:** ready-for-agent

**Build status:** done

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

## Build log

**Ticket 04 — done.** Merged at the user's direction with the fix round
**not independently verified** (see Known-outstanding).

| | |
|---|---|
| Branches | `ticket/04-tenant-repository-content` (build), `fix/04-cache-and-comment` (fix round) |
| Commits | `c83269e` (inherited WIP), `a810a63`, `5be2487`, `9749370`, `1ca58a8`, then `d0b73f4`, `c981ba8`, `4c7e341` |
| Final commit | `4c7e341` |
| Merged to integration branch | `95dc54a` |
| Verify 1 (`1ca58a8`) | CHANGES REQUESTED |
| Verify 2 (`4c7e341`) | **Not run — stopped by the user** |

Built in two passes: the first implementer stalled on an infrastructure watchdog
mid-work, leaving a WIP commit that typechecked but had never been reviewed.

### Three defects found, each invisible to the gates

**1. A crash in the inherited WIP.** `serviceAccountSchema` was declared *below*
the module-scope `export const FIRESTORE = connect()` that used it, so every
credential-carrying process threw `ReferenceError: Cannot access 'k' before
initialization`. No credential-less build reaches that line — which is why
typecheck and build were green while **every real deployment would have failed**.
Confirmed by executing the WIP file with a throwaway credential, then confirmed
fixed. The branch was swept for other temporal-dead-zone shapes; none found.

**2. Turbo strict env mode dropped the credential.** `turbo` runs
`envMode: strict`, so under the deployed command
`pnpm turbo run build --filter=demo-salon` neither `FIREBASE_SERVICE_ACCOUNT` nor
`TENANT_ID` reached the build **even when exported in the shell**. The Site would
have read no Content on any deploy. Fixed by declaring both on the `build` task.
This was found by the fix round, not by the verifier.

**3. Content cached for a year, surviving the build.** `readContent` passed
`unstable_cache` only `tags`, never `revalidate`, taking Next's one-year default —
and `.next/cache` is preserved across builds by `turbo.json` and by Vercel, while
a turbo cache hit could skip `next build` entirely. Reproduced: seed A, build,
overwrite with B, rebuild → still A.

**The obvious fix was wrong, and was rejected on measurement.** `revalidate: <n>`
makes `unstable_cache` lower the enclosing page's revalidate window to its own:
`revalidate: 1` produced `initialRevalidateSeconds: 1` in the prerender manifest —
ISR, putting Firestore back on the public-traffic path and breaking criterion 7.
Shipped instead: `revalidate` left unset with a per-process `randomUUID()` in the
cache key, and `turbo.json`'s **generic** `build` task set `cache: false` with
packages opting back in, so a Site scaffolded by ticket 27 inherits the safe
default. Cost named: one ~170-byte fetch-cache entry per build, never re-read.

### The cross-Tenant leak, closed by construction

The original `TENANT_ID` fallback was defended by a comment claiming a build
without `TENANT_ID` has no credential either — false, and falsified four times.
Ticket 27 scaffolds Sites from this one, so a copied-forward `"demo-salon"`
fallback plus a forgotten `TENANT_ID` would have published one Tenant's Content on
another's Site.

Fixed by making the claim true and removing what it defended: `siteTenant()` in
`@salon/data` throws when a credential is configured without `TENANT_ID`, and
`SITE_TENANT` and the `"demo-salon"` literal are gone from the Site entirely.
**There is no longer a Tenant slug in any Site file to copy forward**, so omission
cannot leak — producing the leak would now require explicitly setting
`TENANT_ID=demo-salon` on another Tenant's project.

### Independently verified on `1ca58a8`

Criterion 7 reproduced end-to-end (built against the emulator, emulator killed,
env unset, served, curled twice — data present, no read possible). Criterion 3
re-proven via a `"use client"` build failure. Criterion 4 reproduced verbatim.
Criterion 9's `defineSection` guard probed directly. Criterion 5 **measured**
(`apps after two evaluations: 1`). Both rules files verified actually denying with
real 403s under the emulators. Built CSS byte-identical to base.

The fix round corrected one of the verifier's mechanisms: with no credential
`next start` **does** emit the `[@salon/data]` warning at boot, so the data module
does load in the serving process — it just never reads. Re-measured with a TCP
server logging connections: **61 public requests → 0 Firestore connection
attempts**.

### Known-outstanding

- **The fix round was never independently verified.** Everything under "Three
  defects" and "cross-Tenant leak" above rests on the implementer's own evidence,
  which was detailed and reproducible but self-reported. First place to look if
  ticket 04 turns out wrong.
- **`apps/demo-salon/.env.example` was rewritten whole by an agent that could not
  read it** — the organisation's `.env*` policy blocks every reviewer too. Diff is
  +11/−7. If it previously held anything beyond `TENANT_ID` and
  `FIREBASE_SERVICE_ACCOUNT`, that content is gone. **Needs a human glance.**
- **Vercel's `.next/cache` restore between deployments is unproven** — reasoned
  from documentation, reproduced only locally.
- **Ticket 12's `revalidateTag` path is unexercised.** The tag is written and `/`
  is fully static (`initialRevalidateSeconds: false`), but no webhook-driven
  regeneration was run.
- **`storage.rules` is written and verified denying, but never deployed.** Cloud
  Storage requires the Blaze plan and the project is on Spark. Not needed until
  ticket 13; deploy it with `--only storage` then.
- **All worktrees share one turbo cache** at `.turbo`. A build in one worktree can
  replay a cached log from another. Use an isolated `TURBO_CACHE_DIR` for any
  measurement that depends on a cold build.
