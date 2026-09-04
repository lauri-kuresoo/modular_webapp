# 08: Gallery, testimonials, FAQ and how to get there

**What to build:** A Visitor can look at photographs of the actual work and
premises, read what previous customers said, get answers to the obvious
practical questions, and find the place on a map with one tap to a route, a
call or an email. Sections delivered: Gallery, Testimonials, FAQ, MapContact.

**Blocked by:** 06 (Chrome and the top of the page).

**Status:** ready-for-agent

## Design and technology choices

**No Google Maps embed. This is the decision to get right in this ticket.** A
Maps iframe sets third-party cookies, which would break the spec's deliberate
choice to ship no consent banner — the whole point of cookieless analytics is
undone by one embed. Instead: a static, cookieless map image plus platform
deep links for the route (Apple Maps and Google Maps directions URLs), a `tel:`
link and a `mailto:` link. The Visitor loses pan-and-zoom in place and gains a
page with no banner over it, which is the trade the spec already made.

**Store the coordinates on the Tenant, not just an address string.** The map
image, the directions links and the `geo` field of the structured data in
ticket 10 all need latitude and longitude. Geocode once at provisioning and
store it; do not geocode at render.

**Gallery uses CSS grid with row spans derived from stored aspect ratios**, not
CSS multi-column and not a JavaScript masonry library. Multi-column fills
column-major, so a Tenant who carefully reorders their photographs in ticket 13
will see an order they did not choose — and preserving their order is an
explicit story. Grid with spans keeps reading order and needs no client
JavaScript.

**Lightbox on the native `<dialog>` element.** Arrow keys between images, Escape
to close, focus restored to the thumbnail that opened it. No carousel library.

**Alt text is required for gallery images**, enforced in the schema, so the
screen-reader story is not quietly defeated by an empty attribute. The
enforcement point is the admin in ticket 13; the schema is here.

**Testimonials do not autoplay.** A rotating carousel is a reduced-motion
problem, an accessibility problem and a "the quote I was reading moved" problem.
Render them as a grid, or as a scroll-snap row that works with native scrolling
and keyboard, with no timer.

**FAQ is `<details>`/`<summary>`.** Native disclosure gives keyboard operation,
correct announcement and a working page with JavaScript disabled, for zero code —
and it maps cleanly onto the FAQ structured data in ticket 10. Do not rebuild it
with buttons and state.

**Both Sections stay content-driven with ordered arrays**, following the same
explicit-order convention as ticket 07 rather than any implicit sort.

**Everything here is still a server component.** The lightbox and nothing else
is interactive, and it should hydrate only when a gallery is present on the page.

## Acceptance criteria

- [ ] Gallery renders in the Tenant's chosen order, using CSS grid with spans from stored aspect ratios, with no layout shift and no masonry library
- [ ] The lightbox uses a native dialog, supports arrow-key navigation and Escape, and restores focus to the thumbnail that opened it
- [ ] Gallery images require alt text at the schema level
- [ ] Testimonials render with no timer and no autoplay; any horizontal arrangement is natively scrollable and keyboard operable
- [ ] FAQ is built on native disclosure elements and works with JavaScript disabled
- [ ] MapContact renders a cookieless static map, a directions deep link for both major platforms, a `tel:` link and a `mailto:` link — and no third-party iframe or script
- [ ] Latitude and longitude are stored on the Tenant document, not geocoded at render
- [ ] The page still sets no cookies; verify in a fresh browser profile
- [ ] All four Sections render from Tenant content in both locales with the Estonian fallback
