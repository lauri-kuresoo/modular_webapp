# 26: Every Section in every Theme, on one page

**What to build:** The Platform Operator opens an owner-only page and sees every
registered Section rendered in every preset, in light and dark, with sample
content. They can check a Theme before showing it to a client, and spot the
Section that breaks in the dense preset before a Tenant does.

**Blocked by:** 15 (Theme presets and picker).

**Status:** ready-for-agent

## Design and technology choices

**Read the spec's position before building this.** The Testing Decisions section
rules out "no Storybook, no visual showcase route". This ticket exists on the
reading that the ban is aimed at test infrastructure, while story 75 asks for an
operator tool used in a sales conversation — a different thing with a different
justification. Nothing else in the plan depends on this ticket. If the Platform
Operator's intent was the broader ban, delete it and close story 75 as declined.

**It lives inside the admin, gated on the `owner` claim**, not as a route on any
Site. A showcase route on a public Site is indexable, adds weight to a Tenant's
bundle and exposes Sections the Tenant has not bought. Behind the owner claim it
is a private tool.

**It is generated from the Section Registry and the preset list, and that is the
entire value.** A new Section or a new preset appears here with no edit to this
page. If maintaining the gallery requires touching it every time a Section is
added, it will fall out of date within two months and then actively mislead —
which is worse than not having it.

**Sample content is declared with the registry entry**, beside the props schema
from ticket 03. Two consequences worth having: the gallery needs no Tenant and no
Firestore read, and a Section author has to state what their Section needs in
order to look right, which is a useful discipline.

**Include the awkward content, not just the flattering content.** A very long
heading, a business name with Estonian diacritics, a service with no
description, an empty list, a single gallery image and twenty. The presets break
on the edge cases and the edge cases are what a real Tenant supplies. Declaring
two or three sample sets per Section is more valuable than one perfect one.

**Layout is a matrix with the axis of comparison controllable.** All presets for
one Section is the useful view when checking a Section; all Sections in one
preset is the useful view when signing off a preset. Support both, and render
light and dark side by side rather than behind a toggle so the comparison is
direct.

**Render the real components with the real theme emitter**, at real widths. A
gallery that renders Sections through a special path proves nothing. Use the
same server-side token emission from ticket 02 with the preset forced per frame,
and include a narrow frame so the mobile layout is in view too.

**Explicitly check the things the sweep in ticket 15 was looking for**: hardcoded
colours surviving a preset change, spacing that only works at one density,
radius applied inconsistently, and any contrast pair that fails in the dark map.
Those four defects are invisible in the preset you developed against and obvious
in a matrix.

**Keep it cheap.** Static, no data, no interactivity beyond the axis toggle. It
must never be the reason a deploy is slow, or it will be the first thing removed.

## Acceptance criteria

- [ ] The gallery is a route inside the admin application gated on the `owner` claim; no Site exposes a showcase route
- [ ] The page is generated from the Section Registry and the preset list; adding a Section or a preset makes it appear with no change to this page
- [ ] Sample content sets are declared alongside each registry entry, and the page reads no Tenant data
- [ ] Each Section declares at least one awkward sample set — long text, diacritics, missing optional fields, or an empty and an overfull list
- [ ] Both comparison axes are available: one Section across all presets, and all Sections within one preset
- [ ] Light and dark render side by side, and a narrow frame shows the mobile layout
- [ ] Sections render through the real components and the real server-side token emitter, with no gallery-specific rendering path
- [ ] A pass over the matrix finds no hardcoded colour, no density-specific spacing, no inconsistent radius and no failing contrast pair — or files what it finds as follow-up tickets
- [ ] The page adds no data fetching and no measurable build-time cost
