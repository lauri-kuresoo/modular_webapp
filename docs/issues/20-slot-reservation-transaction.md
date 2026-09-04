# 20: The slot is actually taken, and the email address is real

**What to build:** A Visitor picks a start time, fills in a short form, and the
slot is held for them while they finish. They are told clearly that it is held
for a few minutes until they click a link in their email. They click it, and
they have an appointment — with a confirmation containing the service, time,
staff member, price, address and a map link. Two Visitors racing for the same
slot cannot both get it.

**Blocked by:** 19 (Availability and slot browsing).

**Status:** ready-for-agent

## Design and technology choices

**One Firestore transaction over one document per staff member per date.** Read
the occupancy document, verify the required contiguous cells are free, write the
booking and the updated occupancy together. The contention point is one document
per person per day, which is exactly right for a business doing tens of bookings
a day, and it means listing availability needs no query. This transaction is
where double-booking is prevented and it is small enough to review by eye —
keep it that way. Nothing else in the codebase may write occupancy.

**Occupancy stores entries, not a bare set of indices.** The spec describes "the
set of occupied Cells"; store instead a list of `{ startCell, endCell, kind,
ref }` where kind distinguishes a confirmed booking, an unverified hold and a
Tenant block, and derive the occupied-cell set from it. The reason for the
deviation: cancelling, expiring a hold and moving an appointment all need to
know *which* thing owns a cell, and a bare index set cannot answer that — you
would need a query across bookings to reconstruct it, which is the query this
model exists to avoid. Recording the deviation here so it is a decision and not
a drift.

**Staff is pinned inside the transaction, and "any" is never persisted.** If the
Visitor chose "any available", pick from the eligible staff that ticket 19
attached to the chosen start, deterministically — lowest display order among
those still free at commit time. Deterministic rather than random so behaviour is
reproducible when a Tenant asks why a booking went to a particular person. Round
robin is explicitly out of scope.

**The booking is created `pending_verification` and holds its cells
immediately.** Holding before verification is what stops the slot being sold
twice while someone checks their inbox. The hold carries an expiry 15 minutes
out.

```
pending_verification --verify--> confirmed --cancel--> cancelled
pending_verification --expire--> expired
confirmed --no_show--> no_show
```

That is the whole machine. Every transition is a transaction that also adjusts
occupancy, and there are no other states — if a ticket seems to need one, it is
a new field, not a new state.

**Verification uses the same signed-token, POST-to-confirm pattern as ticket
18**, for the same reason: mail scanners fetch links. The landing page shows the
appointment and a single confirm button. Verifying flips the entry kind from
hold to booking, clears the expiry and sends the confirmation email.

**An expired hold clicked late is a designed-for outcome, not an error.** The
transaction finds the hold gone, and the Visitor sees "that time was released
because the link was not used in time" with a link straight back to fresh
availability for the same service — not a 500, not a blank page. Expiry is the
common case for a real distracted human, so this page deserves as much care as
the success page.

**The countdown is honest and the server is authoritative.** Show the remaining
hold time in the form, but the expiry is enforced server-side; a client that
lies about the clock gains nothing. Announce the countdown politely and do not
let it steal focus.

**Rate limit by hashed IP before entering the transaction**, reusing ticket 17's
counter. Without it an anonymous stranger can hold out a real business's entire
week for fifteen minutes at a time, repeatedly. This is not a theoretical
concern for a public unauthenticated booking form.

**Submissions carry a client-generated idempotency key** so a double-tap or a
retry after a timeout does not produce two holds for one person. The transaction
checks for an existing booking with that key first.

**The confirmation email contains everything in one message**: service, date and
time with the timezone stated, staff member's name, price, the salon's address, a
map link, the cancellation deadline, and the cancel link that ticket 21 makes
work. A customer should never have to open a second email or the website again.

**Contact fields are name, email, phone and a length-capped logistics note** —
same fields and the same deliberately non-clinical labelling as ticket 17. No
account, ever.

**Booking documents denormalise what the email and the calendar need**: service
name and price as they were at booking time, staff name, duration. A service
retired or repriced next year must not change what last month's appointment
says it was.

**Manual verification of the race.** With no tests, fire two concurrent
submissions for the same start and confirm exactly one succeeds and the other
receives a clean "no longer available" with refreshed times. Do the same for two
overlapping spans that share only one cell. Record the results in the repo
alongside ticket 19's walk-through — this transaction and that arithmetic are the
two places the spec admits it is accepting real risk.

## Acceptance criteria

- [ ] Booking runs in a single transaction over one occupancy document per staff member per date, writing booking and occupancy together
- [ ] Occupancy entries record start cell, end cell, kind (booking, hold or block) and a reference to the owning record; the occupied-cell set is derived
- [ ] The transaction is the only code in the repo that writes occupancy
- [ ] The required span includes the buffer, and a span overlapping any occupied cell is refused
- [ ] A concrete staff member is chosen inside the transaction from the eligible set, deterministically by display order; no booking stores "any"
- [ ] Bookings are created `pending_verification` holding their cells with a 15-minute expiry, and the state machine has exactly the five states listed
- [ ] Verification is a signed token landing on a page whose POST performs the transition; automated GETs of the link change nothing
- [ ] Verifying flips the entry from hold to booking, clears the expiry and sends the confirmation email
- [ ] Clicking an expired link shows a clear explanation and a link back to fresh availability for the same service, never an error page
- [ ] Hold expiry is enforced server-side; the on-screen countdown is announced politely and never steals focus
- [ ] Requests are rate limited by hashed IP before the transaction is entered
- [ ] A repeated submission with the same idempotency key produces one hold, not two
- [ ] The confirmation email contains service, date and time with timezone, staff name, price, address, map link, cancellation deadline and a cancel link
- [ ] Bookings denormalise service name, price, duration and staff name as at booking time
- [ ] No Visitor account is created or required at any point
- [ ] Two concurrent submissions for the same start yield exactly one booking, with the loser told cleanly and shown refreshed times; the manual race verification is recorded in the repo
