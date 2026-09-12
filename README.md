# Modular Salon & Wellness Website Platform

A pnpm + Turborepo monorepo holding a shared component library and one Next.js
application per Tenant. See `docs/specs/0001-modular-salon-platform.md` for the
spec and `docs/index.md` for the implementation tickets.

## Getting started

```sh
nvm use          # Node 22 LTS, pinned in .nvmrc
corepack enable  # so the pnpm version in package.json is the one you run
pnpm install     # installs the whole workspace from the repo root
pnpm dev         # serves apps/demo-salon on http://localhost:3000
```

Pinned versions: Node **22 LTS** via `.nvmrc` (and `engines.node`), pnpm via
`packageManager` in the root `package.json`. Both the Platform Operator's machine
and Vercel read those, so they agree.

TypeScript is pinned to 5.9.3 rather than floating on `latest`, because the
compiler is this repo's only quality gate and a compiler upgrade should be a
deliberate commit.

## Commands

Everything runs from the repo root, through Turborepo.

| Command          | What it does                                                      |
| ---------------- | ----------------------------------------------------------------- |
| `pnpm dev`       | Runs `dev` in every package that has one — in practice, the Sites |
| `pnpm build`     | Builds every app and typechecks every package                     |
| `pnpm typecheck` | `tsc --noEmit` everywhere                                         |
| `pnpm lint`      | ESLint (Next config on apps) everywhere. Not a gate               |
| `pnpm format`    | Prettier, write                                                   |

## Layout

```
apps/
  demo-salon/     the reference Site — develop against this one
packages/
  core/ theme/ ui/ data/ booking/
docs/
  specs/ issues/ agents/
```

### Packages

| Package          | Contents                                                 | May depend on   |
| ---------------- | -------------------------------------------------------- | --------------- |
| `@salon/core`    | Shared types, Zod schemas, the spec's domain vocabulary  | nothing         |
| `@salon/theme`   | Theme tokens and presets; the `themeTokens` seam         | `core`          |
| `@salon/ui`      | Sections, chrome and primitives; the Section Registry    | `core`, `theme` |
| `@salon/data`    | `TenantRepository` and Firestore access. **Server-only** | `core`          |
| `@salon/booking` | `availability` and the `BookingProvider` implementations | `core`          |

Five packages. Resist a sixth without writing down why.

### Dependency direction is one-way

```
core  ←  theme  ←  ui
core  ←  data
core  ←  booking
```

- `core` depends on no other workspace package.
- `ui` may depend on `core` and `theme`.
- `data` and `booking` may depend on `core` only.
- **`ui` must never import `data`.** Sections receive Content as props from the
  app layer. This is what keeps the Firestore Admin SDK out of Site bundles.
- Apps may depend on anything.

There is no CI to enforce this. The enforcement is social plus the packages'
manifests: a missing `dependencies` entry is the cheapest signal available, so
keep them honest and add the edge to the manifest before you add the import.

### Packages ship as TypeScript source, not built artefacts

Every `packages/*` manifest points `exports` straight at `./src/index.ts`. There
is no `tsup`, no per-package build step, no `dist`.

Sites consume them by `workspace:*` and list them in Next's
`transpilePackages`, so Next compiles the source itself. What this buys: no
`dist` drift, no stale-build class of bug, no dual ESM/CJS problem, and one
`tsc` program spanning app and library so a type error in a package fails the
Site build. What it costs: only Next-based consumers can use these packages —
which is exactly the set of consumers this platform has.

A package's `build` script is therefore `tsc --noEmit`. It emits nothing; it
verifies. `turbo.json` declares empty `outputs` for those tasks accordingly.

**When you add a package**, add it to that table, to the consuming app's
`transpilePackages` in `next.config.ts`, and — if it contains components — to
the `@source` list in the app's `app/globals.css` so Tailwind scans it.

## Technology choices

- **Next.js App Router**, React Server Components by default. No `pages/`
  directory, and no client components until a ticket needs interactivity.
- **Every Site page is statically generated.** That is what makes the spec's
  "zero Firestore reads on public traffic" claim true. Site pages declare
  `export const dynamic = "force-static"` so the intent is checkable.
- **Tailwind v4, CSS-first.** No `tailwind.config.js`; configuration lives in CSS
  via `@import "tailwindcss"` and `@theme`. Theme tokens become utilities through
  CSS, not through a JS config object that would have to be regenerated per
  Tenant.
- **TypeScript `strict`**, plus `noUncheckedIndexedAccess` and
  `moduleResolution: "bundler"`, shared from `tsconfig.base.json`.
  `noUncheckedIndexedAccess` is on from the start because the availability
  arithmetic indexes into Cell arrays constantly.

### The type checker is the only quality gate

Per the spec there are no automated tests and no CI. `next build` runs `tsc` and
fails the deploy on a type error. So push correctness into types where you can:
parsed schemas over `as`, discriminated unions over optional-field soup, branded
ids over bare strings.

## Deployment

One Vercel project per Site, one for `apps/admin`.

For each, in the Vercel project settings:

- **Root Directory** — the app folder, e.g. `apps/demo-salon`.
- **Include source files outside of the Root Directory** — on, so the workspace
  packages are available.
- **Install Command / Build Command** — taken from the app's `vercel.json`,
  which runs both from the repo root so pnpm resolves the workspace.
- **Node version** — 22.x, matching `.nvmrc`.

Root Directory is a dashboard-only setting; it cannot be committed. Everything
that can live in the repo lives in `apps/<slug>/vercel.json`.
