# 18: The business answers in two taps, and the customer finds out

**What to build:** A Tenant reads the notification email on their phone, taps
confirm, taps once more to be sure, and it is done — no login. The Visitor gets
an email telling them where they stand. The same requests are listed and
actionable in the admin for a Tenant who prefers that.

With this ticket the request-and-confirm product is complete and client #1 can
go live, per the spec's sequencing.

**Blocked by:** 17 (`BookingProvider` port and request submission).

**Status:** ready-for-agent

## Design and technology choices

**The link is a signed token, verified against current state.** A compact JWS
signed with HMAC-SHA256 from a platform secret, carrying the request id, the
tenant id, the intended action and the token identity stored on the document,
with a short expiry. Verification checks the signature, the expiry, that the
token identity matches, *and* that the request is still `pending`. Statelessness
gives you a link that needs no session; the state check is what makes a replayed
or long-forwarded link harmless.

**A GET must not change anything. This is the decision that matters most here.**
Mail clients, corporate scanners and link previewers fetch every URL in a
message, often more than once. If tapping the link mutates on GET, appointments
will be confirmed and declined by software nobody asked. So the link lands on a
page that states the request and the action, with a single button that POSTs.
"Two taps" in the story is the link and that button — the second tap is not
friction, it is the mechanism.

**A second click is a friendly no-op, not an error.** If the request is already
answered, show what the answer was and when, and offer a link to the admin.
Tenants will forward the email to themselves, tap it twice, and tap it after
answering in the admin.

**Confirming does not write Occupancy in this mode.** The request module does
not model occupancy (ticket 17), so there is nothing to reserve. If the Tenant
wants the time blocked in their calendar they enter it there, once ticket 24
exists. Note this in the code: it is the visible seam between the two modules
and it looks like a missing write.

**One server action does the whole transition**: status, responder, timestamp
and optional message to the customer, then the outcome email. The status write
is the source of truth and a failed email does not roll it back — but it is
recorded on the document, so the admin can show "we could not email the
customer" and the Tenant can phone them. That is a genuinely different situation
from a failed confirm and it needs its own visible state.

**Declining may carry a short optional message**, in the Tenant's own words,
passed through to the outcome email. A bare decline reads as rude and the Tenant
will want to say "fully booked that week, try Thursday". Same length cap and
same absence of any prompt about the reason for the visit.

**The outcome email arrives in the Visitor's stored locale** (ticket 17) and
restates the service, the proposed window and, on confirmation, the address and
a map link — so the customer has everything in one message rather than having to
find the first one.

**The admin list is the same action through a different door.** A requests list
with pending first and oldest first, showing age prominently, since a request
sitting for a day is the thing the Ops Console will complain about in ticket 25.
Same server action, same transition, session-authorised instead of
token-authorised.

**Age is derived, not stored.** The Ops Console needs "unanswered for over 24
hours"; that is a query over creation time and status, not a field somebody has
to keep current.

**Answered requests stay visible with their history.** The Tenant's only record
of who asked for what is this list, and it feeds the retention purge in ticket 28.

## Acceptance criteria

- [ ] Confirm and decline links are signed tokens carrying request id, tenant id, action and token identity, with a short expiry
- [ ] Verification checks signature, expiry, token identity and that the request is still pending
- [ ] Following a link performs no mutation; the action happens only on an explicit POST from the landing page
- [ ] Verify that repeated automated fetches of the link — as a mail scanner would make — change nothing
- [ ] A link for an already-answered request shows the existing answer and when it was given, with no error
- [ ] An expired or tampered token shows a clear message and a route to the admin
- [ ] Confirming or declining writes status, responder identity and timestamp in one action, and sends the Visitor's outcome email
- [ ] A failed outcome email is recorded on the request and surfaced in the admin as a distinct state from a failed transition
- [ ] Decline accepts an optional short message from the Tenant, included in the email, with no prompt for a reason for visit
- [ ] The outcome email is in the Visitor's stored locale and includes service, window, and on confirmation the address and a map link
- [ ] The admin lists requests with pending first, oldest first, showing age, and offers the same actions through the session
- [ ] Unanswered age is derived from creation time and status rather than stored
- [ ] Answered requests remain listed with their outcome and history
- [ ] End to end on a phone: notification email to answered request to customer's email, without logging in
