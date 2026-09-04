# 07: Services, staff and opening hours

**What to build:** A Visitor can see a plain list of services with real prices
and durations, see who works at the business and what they specialise in, and
find out when the place is open — without phoning anyone. Sections delivered:
ServicesList, StaffGrid, OpeningHours.

**Blocked by:** 05 (i18n).

**Status:** ready-for-agent

## Design and technology choices

**Services and Staff are subcollections, not page content.** They are records
with identity that Bookings will reference by id, so they cannot live inside a
page content blob. The Section reads the collection; the Composition only
controls presentation (grouping, whether descriptions show, ordering strategy).

**Money is an integer in minor units plus a currency on the Tenant.** Never a
float, never a pre-formatted string like `"45 €"`. Format at render with the
platform's number formatting for the active locale, so Estonian gets
`45,00 €` and English gets what it should. A price stored as text is a price
that cannot be summed, compared or reformatted, and it will be stored
inconsistently by the second Tenant.

**Durations are integer minutes.** The booking arithmetic in ticket 19 divides
these into cells; anything other than whole minutes creates rounding questions
that have no good answer.

**Retiring a service is a flag, never a delete.** Past and future Bookings
reference the service id and need to resolve its name and price. Set it
inactive: it disappears from the Site and from new bookings, and remains
resolvable forever. Same for Staff.

**OpeningHours renders from the Availability Rules, not from a separate hours
field.** This is the important choice in this ticket. If hours are typed twice,
the Site will eventually advertise hours the booking engine refuses to honour,
and the Visitor blames the business. One source of truth, established here
before ticket 16 builds the editor for it. The Section derives the public
weekly view as a union across active Staff, and shows dated exceptions that
fall within the near future.

**Collapse consecutive identical days.** "Mon–Fri 9–17, Sat 10–14, Sun closed"
rather than seven rows. Purely a rendering concern, but it is the difference
between a scannable block and a wall.

**Hours markup is a description list or a table with real row headers**, with
today marked both visually and in text — not by colour alone. A screen reader
should be able to answer "are they open today" without the user counting rows.

**StaffGrid fixes the portrait aspect ratio at the Section level.** Tenants will
upload photographs of wildly different shapes; the grid crops to a single ratio
with a sensible focal default rather than producing a ragged wall. Store the
image dimensions with the upload (ticket 13) so the grid reserves space.

**Grouping in ServicesList comes from an optional category on the service** and
an explicit order integer. No alphabetical fallback that reorders a Tenant's
carefully arranged price list the moment they rename something.

**Prices and durations are visible before the Visitor chooses.** Both Sections
feed the booking flows in tickets 17 and 19, which must show the same numbers
from the same records — do not duplicate the display logic there, extract it.

## Acceptance criteria

- [ ] Services and Staff are Tenant subcollections with stable ids; Sections render from them, and the Composition controls only presentation
- [ ] Prices are stored as integer minor units with a Tenant-level currency and formatted per locale at render
- [ ] Durations are stored as integer minutes
- [ ] Setting a Service or Staff member inactive removes it from the Site while keeping it resolvable by id
- [ ] OpeningHours renders from Availability Rules — there is no separate opening-hours content field anywhere in the schema
- [ ] Consecutive identical days collapse into ranges, and dated exceptions in the near future are shown
- [ ] Hours use semantic markup with row headers, and today is indicated in text as well as visually
- [ ] StaffGrid renders at a single fixed portrait ratio with space reserved, from Tenant content in both locales
- [ ] ServicesList groups by category and honours an explicit order
- [ ] The price and duration display logic is shared, ready for reuse by the booking flows
