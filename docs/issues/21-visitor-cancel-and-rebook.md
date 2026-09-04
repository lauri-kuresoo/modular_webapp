# 21: Cancelling is easier than not showing up

**What to build:** A customer who cannot make it clicks a link in their email,
confirms, and the appointment is gone and the slot is free for someone else — no
login. If they are past the cancellation deadline, they are told so plainly and
given the phone number instead. Either way they can rebook the same service in
one click.

**Blocked by:** 20 (Reservation transaction and verification).

**Status:** ready-for-agent

## Design and technology choices

**The premise: a no-show costs the business an hour, a cancellation costs it
nothing but a phone call it did not have to make.** So the cancel path must be
the lowest-friction thing in the product. Every email the platform sends about a
booking carries the cancel link — confirmation and reminder both — because the
one a customer can find at 8am is the reminder.

**Same signed-token, POST-to-confirm pattern as tickets 18 and 20.** The link
lands on a page showing the appointment and one button. A GET must not cancel:
the reminder email will be scanned, and an appointment cancelled by a mail
scanner is the worst failure this platform could produce.

**Cancelling releases the cells in the same transaction that sets the status.**
Status and occupancy move together or not at all, exactly as in ticket 20. A
cancelled booking whose cells stayed occupied is a slot the Tenant can never
sell again and will never find.

**The deadline is stated before it matters, not after.** The confirmation email
and the cancel page both say the deadline as a date and time in the Tenant's
zone, not as "24 hours before". "You can cancel free until Thursday 14:00" is
actionable; a policy expressed in hours makes the customer do arithmetic.

**Past the deadline, the button is replaced, not disabled.** Show the deadline
that has passed and the business's phone number as a `tel:` link, with a line
saying to call. A disabled button with a tooltip is a dead end on a phone. The
platform deliberately does not let a late cancellation through — that is the
Tenant's call to make on the phone, and the spec gives them no self-serve
override.

**Cancelling notifies the Tenant by email.** They may have a waiting list in
their head, and a freed Thursday afternoon is worth knowing about immediately.

**A cancelled booking keeps its record.** Status `cancelled`, with who cancelled
(customer or Tenant) and when. The Tenant's history and the retention purge in
ticket 28 both need it, and a Tenant seeing a pattern of cancellations from one
person is legitimate information.

**Book-again is a deep link into the booking widget** carrying the service and
optionally the staff member, so the picker opens pre-filled and the customer
only chooses a time. Include it on the cancel-success page, in the reminder, and
in a short follow-up context — rebooking immediately after cancelling is the
single most likely useful action, and it turns a lost appointment into a moved
one without the platform implementing rescheduling.

**Self-serve rescheduling stays out of scope, and the page says so
constructively.** Cancel-then-rebook is the supported path and the copy should
present it as the path rather than as an absence. A reschedule feature would need
a two-sided transaction across two occupancy documents plus its own race
handling; ticket 24 gives that to the Tenant, who can be trusted with a dialog.

**Every one of these pages works with JavaScript disabled** and in the Visitor's
stored locale. Someone reading their email in a stripped-down mobile client is
exactly the person cancelling.

**Late-click cases are all designed for, none are errors:** already cancelled
(show it), already past (show the phone number), appointment in the past
(explain and offer book-again), token expired or tampered (explain and offer the
phone number).

## Acceptance criteria

- [ ] Every booking email carries a cancel link, including the reminder
- [ ] The link is a signed token landing on a page that shows the appointment; cancellation happens only on an explicit POST, and automated GETs cancel nothing
- [ ] Cancelling sets status and releases the booking's cells in one transaction; a released slot is immediately offered again by the availability endpoint
- [ ] The cancellation deadline is shown as an absolute date and time in the Tenant's timezone in the confirmation email, the reminder and the cancel page
- [ ] Past the deadline the page shows the passed deadline and the business's phone number as a tappable link, with no self-serve override
- [ ] The Tenant is emailed when a customer cancels
- [ ] Cancelled bookings retain their record with canceller identity and timestamp
- [ ] A book-again link pre-fills the booking widget with the same service and optionally the same staff member, and appears on the cancel-success page and in the reminder
- [ ] The absence of self-serve rescheduling is presented as cancel-then-rebook rather than as a missing feature
- [ ] All pages work with JavaScript disabled and render in the Visitor's stored locale
- [ ] Already-cancelled, past-deadline, past-appointment and invalid-token clicks each produce a specific explanatory page, never an error
