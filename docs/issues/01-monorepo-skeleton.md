# 01: Monorepo skeleton with one Site rendering a static page

**What to build:** A Platform Operator clones the repo, installs once, runs one
command, and sees a working Site in the browser — and the same commit deploys to
Vercel as a static page. Nothing is configurable and the page copy is hardcoded.
The deliverable is the ground the other 28 tickets stand on.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

**Build status:** done

## Design and technology choices

**Workspace.** pnpm workspaces for linking, Turborepo for task orchestration and
caching. Pin the pnpm version through `packageManager` in the root manifest and
Node 22 LTS through `.nvmrc`, so the Platform Operator's machine and Vercel agree.

**Package layout.** Five packages, and resist a sixth without writing down why:

- `core` — shared types, Zod schemas, the domain vocabulary from the spec's glossary. Depends on nothing.
- `theme` — theme tokens and presets (ticket 02).
- `ui` — Sections, chrome and primitives (tickets 03, 06–09).
- `data` — `TenantRepository` and Firestore access (ticket 04). Server-only.
- `booking` — `availability` and the `BookingProvider` implementations (tickets 17, 19, 20).

Dependency direction is one-way: `core` ← everything, `ui` may depend on `core`
and `theme`, `booking` may depend on `core` only, `data` may depend on `core`
only. `ui` must never import `data`; Sections receive content as props from the
app layer. There is no CI to enforce this, so state it in the root README and
keep the packages' manifests honest — a missing dependency entry is the cheapest
signal you have.

**Ship packages as TypeScript source, not built artefacts.** Sites consume them
by `workspace:*` and list them in Next's `transpilePackages`. No `tsup`, no
per-package build step, no `dist` drift, no dual ESM/CJS problem. The cost is
that only Next-based consumers can use them, which is exactly the set of
consumers this platform has.

**Apps.** `apps/admin` (ticket 11 onward) and one Site per Tenant at
`apps/<slug>`. Create `apps/demo-salon` in this ticket as the reference Site;
it stays in the repo permanently as the thing you develop against and as the
template source for the provisioning script (ticket 27).

**Framework.** Next.js App Router with React Server Components as the default.
No `pages/` directory, no client components until a ticket needs interactivity.
Every Site page is statically generated — that is what makes the spec's
"zero Firestore reads on public traffic" claim true.

**Styling.** Tailwind v4, CSS-first. No `tailwind.config.js`; configuration lives
in CSS via `@import "tailwindcss"` and `@theme`. This matters for ticket 02:
theme tokens become Tailwind utilities through CSS, not through a JS config
object that would have to be regenerated per Tenant.

**TypeScript.** `strict: true`, `noUncheckedIndexedAccess: true`,
`moduleResolution: "bundler"`. Turn on `noUncheckedIndexedAccess` now rather than
later — the availability arithmetic in ticket 19 indexes into cell arrays
constantly and this is the one compiler flag that catches the off-by-one class.

**The type checker is the only quality gate.** Per the spec there are no tests
and no CI. `next build` runs `tsc` and fails the deploy on a type error, so
every subsequent ticket should push correctness into types where it can — parsed
schemas over `as`, discriminated unions over optional-field soup, branded ids
over bare strings.

**Vercel.** One project per Site, root directory set to the app folder, install
command run from the repo root so the workspace resolves. Configure this Site's
project in this ticket to prove the topology before there are three of them.

**Formatting and linting.** Prettier plus the Next ESLint config, run through
Turbo. Not a gate, just a `pnpm lint`.

## Acceptance criteria

- [ ] `pnpm install` at the repo root installs the whole workspace
- [ ] `pnpm dev` serves `apps/demo-salon` locally; a change to a file in `packages/ui` hot-reloads in it
- [ ] `pnpm build` builds every app and package through Turbo, and a deliberate type error in a package fails the Site build
- [ ] The Site's page is statically generated (no server rendering at request time) and renders hardcoded copy with Tailwind utilities applied
- [ ] A Vercel project exists for `apps/demo-salon` with the app root and repo-root install command, and the current commit is deployed
- [ ] The root README records the package list, the one-way dependency direction, and the "TypeScript source, not built artefacts" decision
- [ ] Node and pnpm versions are pinned in the repo

## Build log

**Ticket 01 — done.**

Built in two passes, because the first implementer was stopped part-way through
its own self-review and the ticket reached `main` before its defects were fixed.

| | |
|---|---|
| Branch (build) | `ticket/01-monorepo-skeleton` |
| Final commit | `f9b27f8` |
| Merged to `main` | `89def22` (PR #1, merged by the user; also carries `6f272d7`, an empty `apps/demo-salon/demo.txt`) |
| Branch (fix) | `fix/01-verifier-findings` |
| Final commit | `be68060` |
| Merged to integration branch | `3c5a103` |

**First verify — CHANGES REQUESTED.** Five of seven criteria held. Two blockers:
a bug in `eslint.config.mjs`, and criterion 5 (Vercel) being outside any agent's
authority.

**The ESLint defect had two independent causes**, both of which had to be fixed
for either to matter, and a first fix attempt was stopped before settling this:

1. `eslint-config-next` exports an entry whose only key is `ignores` — a *global*
   ignore in flat config. Spreading a `files` key onto it demoted it to an
   ordinary file-scoped config, un-ignoring the output it names.
2. Flat-config `ignores` anchor to the config file's directory. This config lives
   at the repo root while Next's patterns are written app-root-relative, so
   `out/**` only ever matched `<root>/out/**`, never `apps/demo-salon/out/**`.

Fixed by passing the ignores-only entry through un-demoted *and* re-anchoring its
patterns to `apps/**/${p}` — derived from the package rather than hardcoded, so
the list cannot drift if `eslint-config-next` changes it, and tighter than `**/`
so a `packages/*/out/` is not silently ignored.

**Second verify — CLEAN.** The verifier confirmed both causes in an isolated
fixture rather than by inference, reproduced the original defect against
`8cc7530` as a control, and re-ran the full over-ignore matrix: generated output
under `apps/**` ignored, real errors under both `apps/**` and `packages/**` still
reported, `@next/next/*` and `jsx-a11y` scoped to `apps/**` only.

**Criterion 5 (Vercel) is satisfied**, by the user directly — the orchestrator
cannot push or act on a Vercel account. Project `demo-salon` is linked with root
directory `apps/demo-salon` and the repo-root install command from
`apps/demo-salon/vercel.json`. Deployment `dpl_8yMYErH8uEXNXPL6j9rsHqs23v6y` of
commit `89def22` is **Ready**, target production. Confirmed serving as prerendered
static content: `https://demo-salon-eight.vercel.app/` returns
`x-vercel-cache: HIT` with `x-matched-path: /`, which is the deployment-level
evidence for the spec's "zero Firestore reads on public traffic" claim. The
generated `demo-salon-lauri-kuresoo.vercel.app` alias sits behind Deployment
Protection and 307s to SSO; the `demo-salon-eight` alias is public.

### Known-outstanding, deliberately not fixed here

- `fix/01-verifier-findings` is merged to the integration branch but **not yet to
  `origin/main`** — that needs a PR. `main` currently still carries the ESLint bug.
- A bare root-level `eslint .` reports `no-undef` on two `dependency-cruiser.config.cjs`
  files under `.agents/` and `.tooling/`. Pre-existing, unrelated to this ticket;
  `turbo run lint` never sees them because it lints per-package.
- `packages/core/src/locale.ts` (`LOCALES`, `localeSchema`, `DEFAULT_LOCALE`) is a
  small forward reach into ticket 05's territory. Judged non-blocking; ticket 05
  picks `next-intl` and nothing here conflicts with that.
- Parked, unmerged, safe to delete: `wip/ticket-01-inflight` (`6659d88`) and
  `wip/ticket-01-inflight-2` (`6b1f9c4`) hold two stopped implementers' unverified
  in-flight edits, including an unvalidated zod-brand refactor of `packages/core`.
