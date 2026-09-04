# 03: Section Registry and a typed Composition renders the page

**What to build:** The Site's page is no longer written — it is assembled. A
typed Composition file in the Site's app lists an ordered set of
`{ type, variant, props }` entries, and the page renders by folding that list
against the Section Registry. Adding a Section to a page is an edit to a config
array; adding a Section to the platform is one registry entry and nothing else.

**Blocked by:** 02 (Theme token contract).

**Status:** ready-for-agent

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
