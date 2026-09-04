# 09: The `Notifier` seam and a working ContactForm

**What to build:** A Visitor fills in a contact form on the Site and the
business receives an email from its own domain that it can simply reply to. The
first real email leaves the platform, through the one seam every later
notification will use.

**Blocked by:** 05 (i18n).

**Status:** ready-for-agent

## Design and technology choices

**`send(message)` takes a typed message, not a body.** The message is a
discriminated union over template kind with the data that template needs —
`{ kind: 'contact_enquiry', … }`, later `{ kind: 'booking_confirmed', … }`.
Callers cannot assemble HTML, so every email the platform sends is defined in
one place and can be reviewed at once. If callers could pass a body, the booking
tickets would each invent their own layout and the Tenant's customers would get
five different-looking emails.

**Templates in React, rendered server-side to HTML plus a plain-text
alternative.** Use a React email component library so templates are written in
the same language as the rest of the platform and can share the price and time
formatting from ticket 07. Always send the text alternative: HTML-only mail is a
deliverability and spam-score problem, and these are transactional messages that
must arrive.

**Resend, one account, per-Tenant verified sending domain.** The `From` address
is on the Tenant's own domain so the mail looks like it came from the business.
`Reply-To` is the Tenant's real inbox, so when a customer replies — and they
will reply to a booking confirmation — the reply reaches the business rather than
a no-reply void.

**Pass an idempotency key on every send.** Serverless retries and double-submits
are normal; a customer receiving two identical confirmations is a support call.
Derive the key from the entity and event (`booking:{id}:confirmed`) rather than
generating a random one, so a retry produces the same key.

**A failed send must never fail the user's action.** The database write is the
source of truth. If Resend is down, the booking still exists and the Visitor
still sees success; the failure is logged and recorded on the entity so the
Tenant Admin can show "confirmation email failed to send". Rolling back a
booking because an email bounced would be strictly worse for everyone.

**Localise the email to the Visitor's locale.** Which locale is the one they
were browsing in — pass it through with the message rather than defaulting to
Estonian, or an English-speaking Visitor gets an Estonian confirmation.

**ContactForm submits through a server action with one shared Zod schema.** The
same schema validates on the client for immediate feedback and on the server for
real. No API route, no client-side fetch, no duplicated validation that will
drift.

**Spam defence is a honeypot plus a minimum fill time, not a captcha.** Every
captcha worth using sets cookies or loads third-party script, which breaks the
no-banner promise established in ticket 08. A hidden field that must stay empty
and a form that must take more than a couple of seconds to fill stops the
volume of automation a three-Tenant platform will actually see. Add the same
hashed-IP rate limiting the booking tickets need if it proves insufficient.

**Collect only name, email, message.** No phone requirement, and no field that
invites a Visitor to describe a medical complaint — the spec's decision to keep
the platform clear of health data starts with how the fields are labelled, not
just which fields exist.

**Progressive enhancement and pending state.** The form works without
JavaScript; with it, the submit button disables and announces its pending state,
and errors are associated with their inputs.

## Acceptance criteria

- [ ] A `Notifier` seam exposes a single `send(message)` where the message is a typed union by template kind; no caller anywhere can pass raw HTML or a subject line
- [ ] Templates are React components rendering both an HTML and a plain-text part, and both are sent
- [ ] Mail goes out through Resend from a Tenant-verified domain with `Reply-To` set to the Tenant's inbox
- [ ] Every send carries a deterministic idempotency key derived from the entity and event
- [ ] A send failure is logged and recorded against the entity, and does not fail or roll back the originating action
- [ ] The email renders in the Visitor's browsing locale
- [ ] ContactForm submits via a server action validated by one shared schema, and works with JavaScript disabled
- [ ] A honeypot field and a minimum fill time are enforced server-side; no captcha, no third-party script, no new cookies
- [ ] The form collects name, email and message only, with no free-text field inviting health information
- [ ] Submission shows an announced pending state and field-associated errors, and the business receives a replyable email
