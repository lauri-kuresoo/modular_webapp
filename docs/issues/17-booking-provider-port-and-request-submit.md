# 17: The `BookingProvider` port and a Visitor asks for an appointment

**What to build:** A Visitor picks a service, proposes one or two preferred
windows on days the business is actually open, adds a note, gives their name,
email and phone, and submits. They immediately see an acknowledgement that says
plainly this is a request and not yet confirmed, and receive an email copy. The
business gets an email about it. Behind this sits the port that makes a Tenant's
booking style a config value.

**Blocked by:** 16 (Availability Rules and policy), 09 (`Notifier` and ContactForm).

**Status:** ready-for-agent

## Design and technology choices

**The port is defined by what both modules can honour, and no wider.** Two
operations: fetch the offerable options for an input, and submit a choice.
Both return discriminated results so the Section can render success, a
validation problem, or "that is no longer available" without knowing which
module answered:

```
interface BookingProvider {
  getOptions(input: OptionsInput): Promise<OptionsResult>
  submit(input: SubmitInput): Promise<SubmitResult>
}
```

The temptation, once ticket 19 exists, will be to widen the port to the union of
both modules' needs — a `holdSlot` here, a `preferredWindows` there. Resist it.
The moment `BookingSection` branches on which provider it has, the port has
stopped earning its keep and a Tenant's booking style is no longer a config
value.

**Mode selection is one field on the Tenant document**, resolved server-side.
The Site never ships both implementations to the browser; the Section is a
server component that renders the client island appropriate to the resolved
provider.

**The request module deliberately does not consult Occupancy.** Per the spec, it
filters against Availability Rules only. So a Tenant using this mode may be
offered a window that is in fact full — that is accepted, because the Tenant
confirms every appointment by hand anyway. Write this down in the module, because
it looks like a bug to anyone reading it later.

**Window filtering is the rules-only path of `availability`, and it is pure.**
Given rules, a date, the timezone and the policy, return which of morning,
afternoon and evening are offerable. No clock read, no I/O — the current time
comes in as an argument. This is the first half of the seam the spec names as the
riskiest arithmetic in the product; keeping it pure is what makes it readable
without infrastructure.

**Window boundaries are fixed in local wall-clock time** (morning, afternoon and
evening as defined ranges), intersected with the day's open intervals. A window
is only offered if the intersection is at least as long as the service takes —
otherwise the Visitor proposes 5pm on a day that closes at 5:15 and gets
declined, which is exactly the wasted round trip this filtering exists to
prevent.

**Minimum lead time and maximum advance shape the date list**, so a closed day,
a fully-out-of-hours day, tomorrow morning when the Tenant needs 12 hours, and
next spring are all simply absent from the picker rather than rejected after
submission.

**Fields are name, email, phone, service, one or two windows, and a note — and
the note's label is a compliance decision.** Label it for practical logistics
("parking, allergies to products, anything we should know about timing"), never
"reason for visit". The spec's decision to stay clear of health data is enforced
by the label, since the field is free text. Cap its length.

**One server action, one shared schema, works without JavaScript.** Same pattern
as ticket 09. Phone is required here because a request-mode Tenant will phone
the customer back.

**The request document is written with status `pending` and a token identity.**
Fields: service id, proposed windows, contact details, note, locale, created
timestamp, and a `jti`-style token id for the signed links ticket 18 will mint.
Store the locale — the outcome email in ticket 18 must arrive in the language
the Visitor was browsing.

**Two emails, both through the `Notifier`.** To the Visitor, an acknowledgement
whose subject and first line both say this is a request awaiting confirmation —
not a confirmation. To the Tenant, a notification with the proposed windows,
the contact details and the confirm and decline links ticket 18 builds. Email
failure does not fail the submission (ticket 09's rule); the request exists and
is visible in the admin regardless.

**On-screen acknowledgement repeats the "not yet confirmed" message and states
what happens next**, with the business's phone number for the impatient. This is
story 21 and it is the difference between a customer who waits and a customer who
turns up unannounced.

**Rate limit by hashed IP before the write.** A Firestore counter document keyed
by a hash of the address with a short window — no new vendor for a platform
serving three Tenants, and it shares the transaction machinery ticket 20 needs.
Hash rather than store the address: it is personal data and the platform has no
use for the original.

## Acceptance criteria

- [ ] A `BookingProvider` port exists with exactly two operations returning discriminated results, and `BookingSection` depends only on the interface
- [ ] A single Tenant field selects the mode, resolved server-side; the Site ships only the selected module's client code
- [ ] Window offerability is computed by a pure function taking rules, date, timezone, policy and the current time as arguments, with no I/O and no clock read
- [ ] A window is offered only when its intersection with the day's open hours is at least the service duration
- [ ] Closed days, out-of-hours-only days, dates inside the minimum lead time and dates beyond the maximum advance window are absent from the picker
- [ ] The module does not read Occupancy, and a comment in it records that this is deliberate
- [ ] The form collects name, email, phone, service, one or two date-and-window pairs and a length-capped note whose label asks about logistics and never about a reason for visit
- [ ] Submission works with JavaScript disabled and validates from one shared schema on both sides
- [ ] A request document is written with `pending` status, the Visitor's locale and a token identity
- [ ] The Visitor sees an on-screen acknowledgement stating this is a request, not a confirmation, and what happens next, including the business's phone number
- [ ] The Visitor receives an acknowledgement email in their browsing locale whose subject makes clear it is not a confirmation
- [ ] The Tenant receives a notification email with the proposal, contact details and action links
- [ ] A failed email send does not fail the submission, and the request is still visible in the admin
- [ ] Requests are rate limited by hashed IP, and the raw address is never stored
