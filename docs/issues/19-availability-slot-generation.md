# 19: Real available start times, on the clock and across the clock change

**What to build:** A Visitor picks a service and sees genuine available start
times on clean quarter-hour boundaries — the union across every staff member who
performs that service by default, narrowed to one person on request. When
nothing is free in the period they are looking at, they are told so and offered
the next date that has something. Nothing is booked yet; this ticket is the
arithmetic and the browsing experience.

This is the riskiest code in the product and it ships without tests. Everything
below is arranged to make it readable by eye.

**Blocked by:** 16 (Availability Rules and policy), 17 (`BookingProvider` port).

**Status:** ready-for-agent

## Design and technology choices

**The signature is exactly the spec's seam and it is pure:**
`(rules, occupancy, service, staff, now, policy) -> Slot[]`. No I/O, no
Firestore import, no clock read — `now` is an argument. Keep it in a package
whose only dependencies are the shared types and a date library, so an
accidental import of the data layer fails to resolve rather than compiling.
Purity here is not elegance; it is the only reason this code can be reasoned
about by reading it.

**Luxon for the timezone arithmetic.** The requirement is converting a local
wall-clock date and time in an IANA zone to a UTC instant, correctly, twice a
year. Luxon does that with a mature IANA implementation, immutable values, and
explicit handling of the local times that do not exist and the ones that happen
twice. Temporal is the nicer API and the eventual destination, but v1 ships
untested arithmetic and the boring, widely-exercised library is the right trade.
Record Temporal as the migration target.

**The one bug to design against, stated plainly: never derive a later local time
by adding a duration to a UTC instant.** Adding 24 hours to a UTC timestamp does
not give the same wall-clock time tomorrow across a clock change, and adding 60
minutes to a local time across the spring shift produces a time that does not
exist. So: enumerate candidates in local wall clock, and convert each candidate
independently to a UTC instant at that candidate's own offset. Every arithmetic
step happens in local time; conversion is the last thing that happens, per
candidate.

**Decide and document the two clock-change edge cases.** A start time that does
not exist (spring forward) is skipped. A start time that happens twice (autumn
back) resolves to the first occurrence. Write both decisions in a comment beside
the conversion, because a reader six months from now will otherwise assume the
library's default is deliberate.

**The algorithm, in the order it should read:**

1. Build the day's open intervals in local wall clock from the weekly rule, or
   from the dated exception if one exists for that date.
2. Convert those intervals to cell index ranges at the Tenant's cell size.
3. Mark the cells occupied by the passed-in occupancy.
4. Compute the required span as `ceil((duration + buffer) / cellSize)` cells,
   where duration resolves through the per-staff override rule from ticket 14
   and buffer through the per-service override from ticket 16.
5. Slide that span across each open interval, emitting a start where every cell
   in the span is free *and* the whole span lies inside one open interval.
6. Convert each surviving start to a UTC instant.
7. Drop starts inside the minimum lead time relative to `now`, and beyond the
   maximum advance window.

**The span includes the buffer, so the buffer can never be double-sold.** A
service that needs recovery time occupies the recovery time. This also means a
booking at the end of the day must leave room for its buffer — which is correct;
the Tenant asked for a moment between clients, including the last one.

**"Any available" is a union that remembers who.** Compute per staff member —
filtered to those whose service list includes this service and who are active —
then merge by start time, each start carrying the staff who can serve it. The
Visitor sees one clean list of times; ticket 20 needs that staff list to pin a
concrete person at write time. Never persist "any".

**Occupancy comes in as data, one document per staff member per date.** The route
handler loads them and passes them in; a missing document means an empty
occupancy, not an error. The pure module never learns where they came from.

**The route handler is thin and cached briefly.** Tenant baked at build, service
and date range and optional staff as parameters, responding with a short
shared-cache lifetime and stale-while-revalidate, per the spec's ~30 seconds.
This is the page's only dynamic island; keep it that way. Validate the
parameters with a schema and reject a range wider than the maximum advance
window, so nobody can ask the handler to scan a decade.

**"Next available date" is a bounded forward scan.** Step forward day by day up
to the maximum advance window, stop at the first date with any slot, and cap the
scan explicitly. Say in the response whether the scan was exhausted or truncated,
so the UI can say "nothing in the next 90 days" rather than implying there is
something further out.

**The date picker shows which dates have availability**, so the Visitor never
clicks into an empty day. That needs a cheap per-date "has any slot" answer for
the visible month — the same computation, with an early exit on the first hit.

**The slot list is a radio group.** Real inputs with real labels, not a grid of
divs with click handlers. Keyboard operable and announced correctly for free,
which is most of what ticket 29 will check.

**Times render in the Tenant's timezone, and the UI says so once.** A Visitor
browsing from another country must not be shown their own local time — the
appointment is at the salon. State the zone in the UI rather than relying on the
Visitor's assumption.

**Prices and durations are visible beside every service before choosing**, reusing
the formatting from ticket 07 rather than reimplementing it.

**Manual verification, since there are no tests.** Walk the arithmetic by hand
against a fixed `now` for: a normal day; a day with an exception; a day where the
last slot's buffer would overrun closing; the spring-forward and autumn-back
dates for the Tenant's zone; a service longer than any open interval; a fully
occupied day; and a day with two staff whose hours only partly overlap. Record
the expected and observed slots for each in the repo — that written record is
the closest thing to a test suite this module will have, and ticket 29 and any
future test effort both start from it.

## Acceptance criteria

- [ ] The module's signature matches the spec's seam, takes `now` as an argument, performs no I/O and cannot import the data layer
- [ ] Slot starts fall on cell boundaries and the required span is `ceil((duration + buffer) / cellSize)` contiguous cells inside a single open interval
- [ ] Duration resolves via the per-staff override rule and buffer via the per-service override, each through the single shared resolution helper
- [ ] All candidate enumeration happens in local wall clock; conversion to UTC happens once per candidate at that candidate's own offset, and no code path adds a duration to a UTC instant to reach another local time
- [ ] Nonexistent local start times are skipped and ambiguous ones resolve to the first occurrence, both documented in place
- [ ] Occupied cells, including buffer cells, are never offered
- [ ] "Any available" is the union across active staff who perform the service, merged by start time and carrying the eligible staff per start; a specific-staff filter narrows it
- [ ] Occupancy is passed in as data; a missing occupancy document is treated as empty
- [ ] The route handler validates its parameters, rejects a range beyond the maximum advance window, and responds with a short shared cache lifetime and stale-while-revalidate
- [ ] An empty period reports the next available date, from a bounded scan that says whether it was exhausted or truncated
- [ ] The date picker indicates which dates have availability before the Visitor clicks
- [ ] The slot list is a native radio group, keyboard operable and correctly announced
- [ ] Times display in the Tenant's timezone with the zone stated in the UI
- [ ] Prices and durations are shown beside services before selection, using the shared formatting
- [ ] The manual verification walk-through — normal day, exception day, closing-time buffer, both clock-change dates, over-long service, full day, partly overlapping staff — is recorded in the repo with expected and observed results
