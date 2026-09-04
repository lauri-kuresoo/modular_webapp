# 16: Availability Rules and the booking policy knobs

**What to build:** A Tenant sets their normal weekly hours once, per staff
member, and adds one-off exceptions for public holidays and a Tuesday afternoon
off — without those exceptions becoming permanent changes. They set the buffer
between clients, how much notice they need, how far ahead people may book, and
the cancellation deadline. The Site's opening hours update on publish.

**Blocked by:** 14 (Services and Staff).

**Status:** ready-for-agent

## Design and technology choices

**Rules are wall-clock; instants are UTC. Keep the two apart and say so.** "I
work 9 to 5 on Tuesdays" is not an instant and must not be stored as one — if it
were, the Tenant's hours would shift by an hour twice a year. So weekly rules
are stored as minutes-from-midnight intervals per weekday, and dated exceptions
as intervals against a calendar date, both in the Tenant's local wall clock. Only
Bookings are UTC timestamps. This split is the foundation the whole
daylight-saving story rests on; ticket 19 does the conversion.

**The Tenant's timezone is a single IANA identifier on the Tenant document.**
One location per Tenant, per the spec's scale assumption. Set at provisioning,
changeable but loudly — changing it reinterprets every rule.

**Exceptions are keyed by date and carry either "closed" or a replacement
interval set.** A closed public holiday and a "this Thursday I open late" are the
same mechanism. They override the weekly rule for that date entirely rather than
merging with it, because merge semantics are ambiguous and a Tenant reasoning
about them will get it wrong.

**Exceptions expire from view, not from data.** Past exceptions stay stored (a
Booking may need explaining) but the editor shows the upcoming ones by default.
An exception list that accumulates three years of holidays is unusable.

**Validate hard at the edge.** Intervals non-overlapping within a day, start
before end, both snapped to the Tenant's cell size, no interval crossing
midnight. Reject on save with a message pointing at the offending row. The
availability module in ticket 19 is the riskiest code in the product and it
should be allowed to assume clean, sorted, disjoint, snapped input — every check
it does not have to do is a branch that cannot be wrong.

**Policy knobs on the Tenant document, with the spec's defaults:** cell size 15
minutes, buffer 10 minutes, minimum lead time 12 hours, maximum advance 90 days,
cancellation deadline 24 hours. Per-service buffer override from ticket 14
layers over the Tenant default.

**Cell size is per Tenant and effectively immutable once bookings exist.**
Occupancy documents store cell indices, so changing the cell size reinterprets
every stored occupancy. Allow it to be set at provisioning, and in the admin
either hide it or gate it behind an explicit warning when any occupancy exists.
This is the sharpest edge in the data model and it deserves a guard rail rather
than a comment.

**Editing hours is a weekly grid with copy-to-other-days.** The realistic input
is "same as Monday" four times; make that one tap. Per staff member, with a
"copy from" another staff member for a salon where everyone works the same
shift.

**Explain each knob in the Tenant's language.** "Minimum notice" is not a term a
salon owner uses; "how late can someone book — at least 12 hours before" is.
These five numbers determine whether the booking engine feels reasonable or
hostile, and a Tenant who does not understand them will leave the defaults, so
the defaults must be the sensible ones.

**Warn when a rule change orphans an existing booking.** Narrowing Tuesday hours
with a Tuesday appointment already booked does not cancel it — the appointment is
real and stands — but the Tenant must be shown which appointments now fall
outside their stated hours.

**Publish after save**, so the Site's OpeningHours Section and the structured
data from ticket 10 follow along. This is the payoff for making hours a single
source of truth in ticket 07.

## Acceptance criteria

- [ ] Weekly rules are stored per staff member as wall-clock minute intervals per weekday; no rule is stored as a UTC instant
- [ ] The Tenant's timezone is a single IANA identifier on the Tenant document, and changing it warns that all rules are reinterpreted
- [ ] Dated exceptions override the weekly rule for that date entirely, supporting both closed-all-day and replacement intervals
- [ ] Past exceptions remain stored but are hidden from the default editor view
- [ ] Save is rejected for overlapping intervals, inverted intervals, intervals not snapped to the cell size, and intervals crossing midnight, with the offending row identified
- [ ] Policy knobs exist on the Tenant document with the specified defaults, and the per-service buffer override layers over the Tenant buffer
- [ ] Cell size cannot be changed silently once occupancy exists; the attempt is either blocked or gated behind an explicit warning
- [ ] The weekly editor offers copy-to-other-days and copy-from-another-staff-member
- [ ] Every knob has plain-language help text avoiding jargon
- [ ] Narrowing hours over an existing appointment warns and lists the affected appointments rather than cancelling them
- [ ] Saving publishes, and the Site's opening hours and structured data reflect the change within seconds
