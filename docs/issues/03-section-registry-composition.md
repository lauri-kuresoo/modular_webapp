# 03: Section Registry and a typed Composition renders the page

**What to build:** The Site's page is no longer written — it is assembled. A
typed Composition file in the Site's app lists an ordered set of
`{ type, variant, props }` entries, and the page renders by folding that list
against the Section Registry. Adding a Section to a page is an edit to a config
array; adding a Section to the platform is one registry entry and nothing else.

**Blocked by:** 02 (Theme token contract).

**Status:** ready-for-agent

**Build status:** done

## Design and technology choices

**The registry is one map, and it is the only map.** A section `type` string
points at an entry holding the component, its props schema, and its allowed
variants. There is no second place where section types are enumerated — no
union type maintained by hand alongside it, no switch statement in the renderer.
Derive the types from the registry object so a new entry is instantly visible to
the type checker.

**Props schemas are Zod.** Zod gives you the runtime parse (needed for content
from Firestore in ticket 04) and the static type from one declaration, which is
the whole reason to prefer it over a hand-written interface plus a validator
that can disagree with it.

**Composition is validated at build, and a failure fails the build.** Parse the
Composition against the registry at module load. An unknown `type`, a variant
the entry does not declare, or props that fail the schema must throw during
`next build`. This is the single most valuable thing this ticket does: with no
tests, the build-time parse is the mechanism that catches a malformed Site
before a Tenant sees it. Never skip an unrecognised section silently.

**Variants are enumerated, not free strings.** The registry entry declares its
variant list; the Composition's `variant` is narrowed to it. "transparent-over-hero"
being a typo that silently falls back to a default is exactly the failure this
prevents.

**A `defineComposition` helper carries the types.** The Platform Operator editing
a Composition should get autocomplete on `type`, then narrowed autocomplete on
`variant` and `props` for that type. Achieved with a discriminated union derived
from the registry — this is worth the type gymnastics because composing Sites is
the main authoring activity in the product.

**Sections are server components by default.** A Section opts into client
interactivity explicitly and locally. The booking widget in ticket 19 is meant
to be the only dynamic island on the page; keeping the default server-side is
what preserves that.

**The render signature anticipates content.** A Section receives its
Composition props and, from ticket 04, the Tenant's Content. Fix the signature
now — props are Platform-Operator-owned layout, content is Tenant-owned values —
so ticket 04 plumbs content in without touching every Section.

**Every Section gets a stable anchor id.** Derived from type plus ordinal or an
explicit `id` in the Composition, so navigation links and skip links in ticket 06
have something to point at.

**Two trivial Sections only.** Build the thinnest possible pair to exercise the
fold — one with a variant, one without. The real Sections are tickets 06–08.
Building them here would couple the registry design to their needs.

## Acceptance criteria

- [ ] A `SectionRegistry` maps `type` to component, Zod props schema and allowed variants, and is the only enumeration of section types in the repo
- [ ] The Site page renders purely by folding its Composition against the registry
- [ ] Editing the Composition reorders and re-parameterises the page with no component changes
- [ ] An unknown `type`, an undeclared `variant`, or props failing the schema fails `next build` with a message naming the offending entry
- [ ] Authoring a Composition gives narrowed autocomplete for `variant` and `props` per `type`
- [ ] Sections render as server components; nothing in this ticket ships client JavaScript
- [ ] Each rendered Section carries a stable anchor id
- [ ] Adding a Section to the platform requires touching the registry and the new component, and nothing else — demonstrate by adding the second one

## Build log

**Ticket 03 — done.**

| | |
|---|---|
| Branch | `ticket/03-section-registry-composition` |
| Commits | `22b23c0`, `efc7825`, `8f145ae`, `0ca79e3`, `f0331f7` |
| Final commit | `f0331f7` |
| Merged to integration branch | `036749d` |
| Verify | **CLEAN** on the first pass — no fix round |

First ticket built under the rewritten `implementer`/`verifier` definitions, which
carry clean-code and module-shape rules inline instead of delegating to skills.

### The design decision that matters for 06–09

**Anchor ids are assigned by the platform, not by Sections.** `ComposedPage` wraps
every Section in `<section id={…}>` unconditionally; a Section returns only its
children and has no mechanism to omit one. Ids derive from the type on first
appearance, then `type-2`/`type-3`; an explicit `id` overrides, and duplicates or
non-fragment ids throw at module load.

This is the direct answer to ticket 02 being bitten twice by decisions that looked
correct and silently never applied because callers could override them. The rule
generalised: put the decision where a caller cannot forget it.

**The registry is the only enumeration.** `SectionType`, per-type props and
per-type variants all derive from `typeof SECTION_REGISTRY`. The verifier grepped
for a second enumeration and a `switch` and found neither — the only `switch` hits
are comments saying there isn't one.

**Adding a Section is two files.** Demonstrated by commit `efc7825`: exactly
`prose-block.tsx` (new) plus two lines of `registry.ts`. Placing it on a page is a
separate one-file commit.

### Independently verified

The verifier reproduced five failure modes against a real `next build`, each
naming the offending entry — unknown type, undeclared variant, missing required
variant, variant on a variantless Section, props failing schema — and confirmed
each also fails first as a type error. It exercised anchor numbering with a
five-entry probe (`intro`, `prose-block`, `page-heading-2`, `page-heading-3`,
`prose-block-2`), confirmed the `renderSection` assertion is covered by the
module-load parse, and checked the `variant?: never` comment by compiling the
alternative — it is true.

It also **rebuilt base `a346965` in a separate worktree** and diffed built-CSS
selectors: additions are exactly `first:`, `pb-12`, `pb-6`, `pt-20`, `text-center`,
`text-left`. It reproduced the stray-rule defect the implementer had caught in
itself (`.block`, `.lowercase`, `.ordinal`, `.static`, `.visible`, generated by
Tailwind's scanner from ordinary English in doc comments) before accepting the fix.

### Known-outstanding

- **`Composition` is structural, so `defineComposition` is not the only door.**
  `PlacedSection.props` is `unknown` and `variant` is `string | undefined`, so a
  hand-annotated literal typechecks and `ComposedPage` accepts it —
  `const FORGED: Composition = [{ id: "x", type: "page-heading", variant:
  "nonsense", props: 42 }]` compiles clean and renders an empty `<h1>` rather than
  throwing. No realistic author writes that, so it did not block. **But tickets 12
  and 15 build Compositions against this interface**, and a `unique symbol` brand
  on `PlacedSection` applied in `assignAnchorIds` would close it and make the
  soundness claim a fact rather than a convention. Worth doing before 12.
- **`z.object` is non-strict**, so an unrecognised prop key is stripped rather than
  throwing. Covered today by TypeScript's excess-property check at the literal;
  becomes a real gap on **ticket 12's data path**, where the compiler never sees
  the object.
- **`Button` and `Card` now have zero call sites** anywhere in the repo until
  tickets 06–08, because the demo page's Theme specimen was replaced by the
  Composition (authorised by ticket 02's own page comment). A Theme regression in
  those primitives would be invisible in the demo build. Their Tailwind classes are
  still emitted — the `@source` scan is file-based, not usage-based — and `tsc`
  still covers them, so the loss is visual review only. The verifier recommended
  leaving it rather than inventing a third Section.
- **Nothing enforces the comment-scanning hazard.** Both ticket 02 and ticket 03
  shipped stray CSS rules generated from prose in doc comments, and both were
  caught only by manually diffing built-CSS selectors. The next Section ticket can
  reintroduce it silently. A check in CI would close a defect class this repo has
  now hit twice.
- **`packages/ui/package.json` declares `@salon/core` and `@salon/theme`** but no
  file under `packages/ui/src` imports either. Pre-existing at `a346965`, not this
  branch.
- Editor autocomplete narrowing is inferred from the `tsc` evidence, not observed
  by driving a language server.
