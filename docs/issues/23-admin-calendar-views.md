# 23: The Tenant can see their day and their week

**What to build:** A Tenant pulls out their phone between clients and sees
today's appointments as a list — who, what, when, and their phone number. At the
computer they see the week as a grid and can take in its shape at a glance.
Read-only; the actions are ticket 24.

**Blocked by:** 20 (Reservation transaction and verification).

**Status:** ready-for-agent

## Design and technology choices

**Two genuinely different views, not one responsive compromise.** The phone
question is "what is happening today and who do I call"; the desktop question is
"what shape is my week". A shrunken week grid answers neither. Choose the view
from the viewport, and let each be the best version of itself.

**The day list is the primary view and it is built first.** Chronological, with
gaps visible so the Tenant can see where they are free, showing customer name,
service, time, duration and a tappable phone number. The phone number is the
most valuable thing on this screen — the reason a salon owner opens it is often
to call the next customer.

**The week grid puts staff on columns and time on rows.** Capacity is staff-only
and there is one location, so staff is the only meaningful second axis. Time
granularity follows the Tenant's cell size for alignment, but label at the hour
so the grid stays readable.

**Render server-side from bookings plus occupancy for the range.** Occupancy
already holds the entries with their kinds (ticket 20), so blocks, unverified
holds and confirmed bookings come from one read per staff member per day rather
than a query per type. Bookings supply the customer detail the entries reference.

**The three kinds must be visually distinct, and not by colour alone.** A
confirmed booking, a Tenant block and a 15-minute unverified hold mean different
things — the hold in particular is about to disappear and the Tenant should not
plan around it. Distinguish by label and pattern as well as colour, and show a
hold's remaining time.

**Everything renders from UTC instants into the Tenant's timezone, with the zone
stated once in the interface.** The Tenant may be travelling. Their calendar is
their salon's calendar, always.

**No drag and drop**, per the spec. Moving an appointment is the explicit dialog
in ticket 24. On a phone, dragging appointments is how you accidentally move
someone's haircut while scrolling.

**Cancelled and no-show appointments stay visible in past views** and are hidden
from the future by default with a toggle. A cancelled slot in the past is
history; in the future it is noise.

**Navigation is cheap and stateful in the URL.** Previous and next day or week,
plus a jump to today, with the date in the URL so a Tenant can bookmark or
refresh without losing their place.

**Fast on a phone, and honest when it is not.** This is the screen opened for
ten seconds between clients. Server-render the current day, keep the payload
small, and show a real loading state rather than a blank grid.

**One neutral theme, dense and high contrast**, per ticket 11. Data density
beats brand here.

**A staff filter on the week grid** for a salon with more columns than fit.
Default to all, remember the choice per session.

## Acceptance criteria

- [ ] A chronological day list is the mobile view, defaulting to today, showing customer name, service, time, duration and a tappable phone number, with free gaps visible
- [ ] A week grid is the desktop view with staff as columns and time as rows, labelled at the hour and aligned to the cell size
- [ ] Both views render server-side from bookings plus occupancy entries, without a query per entry type
- [ ] Confirmed bookings, Tenant blocks and unverified holds are distinguishable by label and pattern as well as colour, and holds show their remaining time
- [ ] All times render in the Tenant's timezone from stored UTC instants, with the zone stated once in the interface
- [ ] No drag-and-drop interaction exists in either view
- [ ] Cancelled and no-show appointments show in past views and are hidden from future views behind a toggle
- [ ] Previous, next and today navigation works in both views with the date reflected in the URL
- [ ] The week grid offers a staff filter that persists for the session
- [ ] The day view is usable one-handed on a phone and shows a real loading state rather than an empty grid
