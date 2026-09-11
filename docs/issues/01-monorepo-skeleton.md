# 01: Monorepo skeleton with one Site rendering a static page

**What to build:** A Platform Operator clones the repo, installs once, runs one
command, and sees a working Site in the browser — and the same commit deploys to
Vercel as a static page. Nothing is configurable and the page copy is hardcoded.
The deliverable is the ground the other 28 tickets stand on.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

**Build status:** claimed

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
