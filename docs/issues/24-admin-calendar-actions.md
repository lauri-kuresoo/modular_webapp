# 24: The Tenant can change their calendar

**What to build:** A Tenant enters the phone booking they just took, blocks out
Tuesday afternoon for the dentist, cancels an appointment and has the customer
emailed for them, marks the person who did not turn up, and moves an appointment
through a dialog that only offers valid times. Online availability now reflects
reality.

**Blocked by:** 23 (Calendar views).

**Status:** ready-for-agent

## Design and technology choices

**Every action goes through the same transactional occupancy path as Visitor
booking.** One write path, from ticket 20, or the two will disagree — and the way
they disagree is a Tenant's manual booking and a Visitor's online booking
landing on the same slot. If an action needs something the transaction does not
offer, extend the transaction; do not write a second one.

**Manual booking may override hours but never a collision. These are two
different overrides and only one is allowed.** A phone booking at 19:00 on a
closed Sunday is entirely legitimate and the Tenant is the authority on their own
time — so offer it with a clear "outside your opening hours" confirmation. Two
appointments in the same cell is not a decision, it is a mistake, and it is
refused. Say which one is happening in the message, because a blanket "not
available" for both teaches the Tenant to distrust the tool.

**Manual bookings need less than online ones.** Name and optionally a phone
number; email optional, and if absent no customer emails are sent for that
booking, which the interface should state. A walk-in has no email address and
demanding one will make the Tenant type a fake.

**Block time is an occupancy entry, not a booking.** Kind `block`, with a short
reason label the Tenant chooses (lunch, holiday, errand), no customer, and
support for all-day and multi-day. A block written as a fake booking would show
up in reminder sends, in customer-facing counts and in the retention purge, all
wrongly.

**Multi-day blocks write one entry per staff-day.** Occupancy is per staff member
per date; a holiday is that many entries in one batch. Keep the transaction
boundary per day and the batch atomic per action, and cap the block length so a
mistyped year cannot write ten thousand documents.

**Cancelling from the admin sends the customer email automatically.** This is the
whole story: the Tenant should not have to compose the message. Offer an optional
short note included in the email, default to a polite template, and let them see
what will be sent before it goes. Same transaction as ticket 21 — status and
occupancy together.

**No-show is terminal and keeps the cells.** The hour was lost whether or not the
customer arrived, so the occupancy stays; the status records what happened.
Available only for appointments whose start time has passed. This is the
Tenant's private record and nothing about it is sent to the customer.

**The move dialog reuses the ticket 19 availability picker unchanged.** That is
why the picker was built as a component rather than a page. The Tenant picks the
target the same way a Visitor would, which means the dialog cannot offer an
invalid time and there is no second implementation of "which times are valid".

**A move is one transaction across two occupancy documents.** Free the old cells
and take the new ones together — a move that half-commits either double-books
the target or loses the appointment. Both the old and new documents are read
inside the transaction and the new cells verified free at commit time, exactly as
in ticket 20. Moving within the same day and staff member touches one document;
across days or staff, two.

**A move emails the customer with the new time.** Silently moving someone's
appointment is worse than cancelling it. Include the new details and a fresh
cancel link.

**Every mutation records who did it and when.** The Tenant and the Platform
Operator can both be in this interface; the audit trail on the booking is the
only way to answer "who moved this".

**Destructive actions confirm with the specifics.** "Cancel Kadri's 14:00 colour
treatment on Thursday and email her?" — not "are you sure?". This interface is
used one-handed on a phone between clients and the mis-tap is the realistic
failure.

**No undo, and therefore no ambiguity in the confirmation.** Undo across email
sends is not honest — the message has already gone. Better a specific
confirmation than an undo that cannot recall an email.

## Acceptance criteria

- [ ] All five actions write through the same transactional occupancy path as Visitor booking; no second occupancy write path exists
- [ ] Manual booking outside opening hours is permitted after an explicit confirmation naming the reason; a cell collision is refused, and the two outcomes have distinct messages
- [ ] Manual bookings require only a name, with phone and email optional, and the interface states that no customer email will be sent when the address is absent
- [ ] Block time writes occupancy entries of kind `block` with a reason label, supports all-day and multi-day, and is capped in length
- [ ] A multi-day block writes one entry per staff-day atomically for the action
- [ ] Blocks are excluded from reminder sending, customer-facing counts and the retention purge
- [ ] Cancelling from the admin sets status and releases cells in one transaction and sends the customer email automatically, with an optional note and a preview of what will be sent
- [ ] No-show is available only after the appointment start has passed, is terminal, retains the occupied cells and sends nothing to the customer
- [ ] The move dialog uses the ticket 19 availability picker component unchanged and cannot offer an invalid target
- [ ] A move frees the old cells and takes the new ones in a single transaction that verifies the target cells free at commit time, across two occupancy documents where needed
- [ ] A move emails the customer the new details with a fresh cancel link
- [ ] Every mutation records the acting identity and timestamp on the booking
- [ ] Destructive confirmations name the customer, service and time rather than asking generically
- [ ] After a manual booking or block, the online availability endpoint no longer offers the affected times
