# 27: Onboarding a client takes minutes

**What to build:** The Platform Operator runs `pnpm new-client <slug>` and gets
a Tenant document, seeded default content in both locales, an admin user who can
log in, a scaffolded Site app, a Vercel project, and a printed checklist of the
DNS and email-verification steps only a human can do. The client sees something
real on day one. A second command redeploys the whole fleet after a library fix.

**Blocked by:** 15 (Theme presets and picker), 11 (Admin shell).

**Status:** ready-for-agent

## Design and technology choices

**A Node script in the repo, run locally with admin credentials in the
environment.** Not a web interface: self-serve signup is explicitly out of
scope, this runs a handful of times a year, and it needs to write files into the
repository and commit them — which a serverless function cannot do.

**Idempotent and resumable, step by step. This is the requirement that matters
most.** Each step checks whether it has already been done and skips it. The
script touches five systems (Firestore, Firebase Auth, the filesystem, git,
Vercel) and one of them will fail halfway on the first real run. A
half-provisioned Tenant you cannot retry is the worst possible outcome — you end
up finishing it by hand, inconsistently, and the second Tenant does not match
the first. Make re-running the command the recovery procedure.

**Print a plan and confirm before touching anything.** Show what will be created
and with what values; proceed on confirmation. Support a dry run that only
prints.

**The steps, in order, each independently skippable:**

1. Validate the slug — lowercase, URL-safe, not already taken as a Tenant or as an app directory.
2. Create the Tenant document: timezone, currency, locale set, booking mode, theme name, and every policy knob at the ticket 16 defaults. Nothing left undefined; a missing policy field is a runtime failure in the availability arithmetic.
3. Seed default content for every Section in the starting Composition, in Estonian and English, with the theme selected.
4. Create the admin user and set the `tenantId` claim server-side; send a password-reset email rather than inventing a password to relay over a chat app.
5. Scaffold `apps/<slug>` by copying a real template directory from the repo, substituting slug, tenant id and display name.
6. Create the Vercel project via its API: repository, app root directory, repo-root install command, and the environment variables (tenant id, Firebase credential reference, revalidate secret). Store the project id on the Tenant document for ticket 25.
7. Generate the revalidate shared secret, store it on the Tenant document and set it in the Vercel project — both sides in one step so they cannot drift.
8. Print the manual checklist.

**The scaffold source is a real app directory in the repository, not template
strings in the script.** A template that is itself a working app can be type
checked, built and kept current by the ordinary work of the project. String
templates in a script rot silently and nobody notices until the next client.

**Seed content must be genuinely presentable.** Real placeholder copy in
Estonian about a plausible salon, a licensed stock hero image, three services
with prices, two staff members, a few FAQ entries. "Lorem ipsum" is not
"something real from day one" — the client's first impression of the platform is
this page, and it should look like a website they could publish today with the
words changed.

**Print the manual steps as a numbered checklist with the actual values**, not as
a link to documentation: the exact CNAME record with its target, the two TXT
records for email authentication with their values from Resend, and the
verification click. Write the same checklist to a file in the new app's
directory so it survives the terminal scrolling away, and so the next person can
see what was meant to be done.

**Do not attempt DNS automation.** Out of scope in the spec, the Tenant owns the
domain, and the registrar is different every time.

**A separate `pnpm roll-out` command redeploys every Site project** through the
Vercel API, so a library fix reaches the fleet in one command rather than N
clicks. Print what will be redeployed and confirm; report each result; do not
stop the run because one project failed. This is the mechanism behind "fix a bug
once and roll it to every Site", and without it that story is manual work that
scales with client count — the exact thing the platform exists to avoid.

**Both commands are documented in the repository** with the environment
variables they need and what to do when each step fails. This is the runbook the
Platform Operator will read in a year having forgotten all of it.

## Acceptance criteria

- [ ] `pnpm new-client <slug>` performs all eight steps and produces a Tenant that can be logged into and a Site that builds and deploys
- [ ] Every step checks whether it has already been done and skips it; re-running after a mid-way failure completes the provisioning without duplicating anything
- [ ] The script prints a plan and requires confirmation, and supports a dry run
- [ ] Slug validation rejects unsafe slugs and slugs already used by a Tenant or an app directory
- [ ] The Tenant document is created with timezone, currency, locales, booking mode, theme and every policy knob explicitly set to a default; no policy field is left undefined
- [ ] Seeded content covers every Section in the starting Composition in both locales and is presentable as a real page, not placeholder gibberish
- [ ] The admin user is created with its `tenantId` claim set server-side and receives a password-reset email; no password is generated for relay
- [ ] The Site is scaffolded by copying a working template app directory from the repo, and the template builds as part of the ordinary build
- [ ] The Vercel project is created with the correct root directory, repo-root install command and environment variables, and its project id is stored on the Tenant document
- [ ] The revalidate secret is generated once and written to both the Tenant document and the Vercel project in the same step
- [ ] The manual DNS and email-verification steps are printed as a numbered checklist with actual values and also written to a file in the new app directory
- [ ] `pnpm roll-out` redeploys every Site project, confirms first, reports per-project results and continues past individual failures
- [ ] Both commands are documented with their required environment variables and per-step failure recovery
- [ ] Provisioning a second Tenant end to end produces a working, deployed, logged-into Site with no manual repository editing
