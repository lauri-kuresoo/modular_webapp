# Spec 0001 — Modular Salon & Wellness Website Platform (v1)

**Status:** ready-for-agent
**Source:** grill session, 2026-09-04 (35 decisions, Q1–Q35)
**Scope:** the whole v1 platform — this is a foundational spec, not a feature spec

---

## Glossary

No `CONTEXT.md` exists yet, so this spec establishes the domain vocabulary. All
subsequent code and docs use these terms exactly.

| Term | Meaning |
|---|---|
| **Tenant** | One paying business (a salon, a masseuse). The unit of billing, data ownership and configuration. |
| **Site** | The public website belonging to one Tenant, deployed as its own application. |
| **Section** | A self-contained, parameterised block of a Site's page (Hero, ServicesList, FAQ). |
| **Section Registry** | The single map from a section `type` string to its component and props schema. |
| **Composition** | The ordered list of Section configs that makes up a Site's page. Lives in git. |
| **Content** | The Tenant-editable values inside Sections (texts, images, prices, hours). Lives in Firestore. |
| **Theme** | A named token set — semantic colours, type pairing, radius, density, shadow level. |
| **Service** | A bookable offering with a duration and price (e.g. "Massage 60 min"). |
| **Staff** | A person who performs Services. The only capacity constraint in v1. |
| **Availability Rules** | A Staff member's weekly opening hours plus dated exceptions. |
| **Cell** | One 15-minute unit of a Staff member's day. The atom of scheduling. |
| **Occupancy** | The set of occupied Cells for one Staff member on one date. |
| **Booking** | A confirmed appointment occupying contiguous Cells. |
| **Booking Request** | A customer's proposed appointment awaiting Tenant confirmation. |
| **Tenant Admin** | The shared application where Tenants manage their Site and calendar. |
| **Ops Console** | The role-gated area of Tenant Admin where the Platform Operator sees all Tenants. |
| **Platform Operator** | Us. The party who builds, hosts and bills. |
| **Visitor** | An end customer browsing a Site. Never has an account. |

---

## Problem Statement

Small appointment-based businesses — masseuses, hair stylists, nail salons —
need a website that does two jobs: convince a stranger to trust them, and let
that stranger book an appointment without a phone call. Today they either have
no site, a dead Facebook page, or a one-off build that nobody maintains.

From the Platform Operator's side, the problem is economics. Building each of
these sites as a bespoke project means the third client costs as much as the
first, every site drifts into its own unmaintainable shape, and a security fix
has to be applied by hand N times. There is no way to look at all client sites
at once and know whether they are up, current, or quietly failing.

And from the Tenant's side, a site they cannot change themselves is a site that
goes stale within a month. A salon owner needs to block off next Tuesday
afternoon from her phone, between clients, without emailing anyone.

## Solution

A shared component library plus a per-Tenant application, in one monorepo.

A new Site is assembled from registered Sections rather than written. Its layout
is a typed Composition file in git, owned by the Platform Operator; its Content
lives in Firestore, owned and edited by the Tenant. Styling comes from a named
Theme — a token set the Tenant can pick from a short list — and no Section ever
knows which Theme is active, because every Section reads semantic CSS custom
properties rather than colours.

Appointments are handled by one of two interchangeable booking modules behind a
single `BookingProvider` port: a lightweight request-and-confirm flow for
Tenants who want to vet every appointment, and a real self-service slot engine
for Tenants who want customers to book unsupervised.

One shared Tenant Admin serves every Tenant, resolved by the logged-in user's
claim, with an Ops Console inside it that shows the Platform Operator the state
of every Site at once.

---

## User Stories

### Visitor — finding and trusting the business

1. As a Visitor, I want the Site to load almost instantly on mobile data, so that I do not give up before seeing anything.
2. As a Visitor, I want to find the business in Google when I search for its service and my town, so that I can discover it at all.
3. As a Visitor, I want to see the business's opening hours, address and phone number in the search result itself, so that I can act without opening the site.
4. As a Visitor, I want to see photographs of the actual premises and work, so that I can judge whether this place is for me.
5. As a Visitor, I want to see who works there and what they specialise in, so that I can pick someone I feel comfortable with.
6. As a Visitor, I want to see a plain list of services with real prices, so that I do not have to phone to find out whether I can afford it.
7. As a Visitor, I want to read what previous customers said, so that I can trust a business I have never visited.
8. As a Visitor, I want answers to obvious questions (parking, how early to arrive, whether to shower first), so that I do not have to ask.
9. As a Visitor, I want a map and a one-tap route, so that I can find the place.
10. As a Visitor, I want a one-tap phone call and a one-tap email, so that I can use whichever channel I prefer.
11. As a Visitor, I want the site in Estonian, or in English if I do not read Estonian, so that I can understand it.
12. As a Visitor, I want a page that is not covered by a cookie banner, so that I can read it immediately.
13. As a Visitor using a screen reader, I want the site to be navigable and announced correctly, so that I can book independently.
14. As a Visitor who prefers reduced motion, I want animations suppressed, so that the site does not make me unwell.
15. As a Visitor in dark mode, I want the site to respect that, so that it is comfortable at night.

### Visitor — requesting an appointment (BookingRequest)

16. As a Visitor, I want to pick a service and propose one or two preferred windows, so that I can ask for an appointment without a phone call.
17. As a Visitor, I want to be offered only dates and windows when the business is actually open, so that I do not propose a time that will be rejected.
18. As a Visitor, I want to add a note, so that I can mention something the form does not ask about.
19. As a Visitor, I want to give only my name, email and phone, so that the form takes seconds.
20. As a Visitor, I want an immediate on-screen acknowledgement and an email copy, so that I know the request arrived.
21. As a Visitor, I want a clear statement that this is a request and not yet confirmed, so that I do not turn up unannounced.
22. As a Visitor, I want an email when the business confirms or declines, so that I know where I stand.

### Visitor — booking a slot (SlotBooking)

23. As a Visitor, I want to pick a service and see real available start times, so that I can book without any back-and-forth.
24. As a Visitor, I want to book with "any available" staff by default, so that I get the widest choice of times.
25. As a Visitor, I want to filter by a specific stylist, so that I can keep going to the person I trust.
26. As a Visitor, I want start times on clean quarter-hour boundaries, so that the list is easy to read.
27. As a Visitor, I want to see prices and durations next to each service before choosing, so that I choose knowingly.
28. As a Visitor, I want times shown in local time and correct across the daylight-saving switch, so that I arrive at the right hour.
29. As a Visitor, I want to be told when nothing is available in the period I am looking at, and be shown the next available date, so that I do not have to click through empty weeks.
30. As a Visitor, I want my chosen slot held while I finish the form, so that it is not taken from under me.
31. As a Visitor, I want to confirm via a link in my email, so that my address is verified and my confirmation actually reaches me.
32. As a Visitor, I want to be told clearly that the slot is only held for a few minutes until I click that link, so that I do not lose it by accident.
33. As a Visitor, I want a confirmation email with the service, time, staff member, price, address and a map link, so that I have everything in one place.
34. As a Visitor, I want a reminder the day before, so that I do not forget.
35. As a Visitor, I want to cancel from a link in my email without logging in, so that cancelling is easier than not showing up.
36. As a Visitor, I want to be told the cancellation deadline, and to be given the phone number once it has passed, so that I know what to do.
37. As a Visitor, I want a "book again" link, so that rebooking is quick.
38. As a Visitor, I do not want to create an account, so that nothing stands between me and the appointment.

### Tenant — managing the calendar

39. As a Tenant, I want to see today's appointments as a list on my phone, so that I can check my day between clients.
40. As a Tenant, I want a week grid on my computer, so that I can see the shape of my week.
41. As a Tenant, I want to enter a phone or walk-in booking myself, so that online availability reflects reality.
42. As a Tenant, I want to block out time for lunch, errands or holidays, so that nobody books me while I am away.
43. As a Tenant, I want to set my normal weekly hours once, so that I do not have to manage each week by hand.
44. As a Tenant, I want to add one-off exceptions such as public holidays, so that the exception does not become a permanent change.
45. As a Tenant, I want to cancel an appointment and have the customer emailed automatically, so that I do not have to write the message.
46. As a Tenant, I want to move an appointment through an explicit dialog that shows me valid times, so that I cannot accidentally create a clash.
47. As a Tenant, I want to mark a no-show, so that I have a record of who wastes my time.
48. As a Tenant, I want to confirm or decline a booking request from a link in the notification email, so that I can answer in two taps without logging in.
49. As a Tenant, I want a buffer automatically added after each service, so that I get a moment between clients.
50. As a Tenant, I want a minimum notice period, so that nobody books me for twenty minutes from now.
51. As a Tenant, I want a limit on how far ahead people can book, so that my calendar next spring is not already full.

### Tenant — managing the site

52. As a Tenant, I want to edit my own texts, so that I am not dependent on anyone to fix a typo.
53. As a Tenant, I want to upload and reorder my own photographs, so that my gallery stays current.
54. As a Tenant, I want to add, rename, reprice and retire services, so that my price list is always right.
55. As a Tenant, I want to add and remove staff and set their hours, so that the site matches who actually works here.
56. As a Tenant, I want to give a staff member a different duration for the same service, so that a slower colleague is not double-booked.
57. As a Tenant, I want to pick from a short list of colour and personality themes, so that the site feels like mine without a designer.
58. As a Tenant, I want my edits live within seconds of saving, so that I can see that they worked.
59. As a Tenant, I want to be shown which fields are not yet translated, so that I can fill them in when I have time.
60. As a Tenant, I want an untranslated field to fall back to Estonian rather than appear blank, so that a half-translated site is never a broken site.
61. As a Tenant, I want to log in with an email and password, so that access is simple.
62. As a Tenant, I want to be certain no other business can see my customers' details, so that I can trust the platform with them.
63. As a Tenant, I want customer contact details deleted after a retention period, so that I am not holding personal data forever.

### Platform Operator

64. As a Platform Operator, I want to create a new Tenant with one command, so that onboarding a client takes minutes.
65. As a Platform Operator, I want a new Site seeded with sensible default content, so that a client sees something real from day one.
66. As a Platform Operator, I want to compose a Site from registered Sections without writing components, so that a build is configuration.
67. As a Platform Operator, I want a bespoke client request to become a new Section or a new variant available to everyone, so that the fleet never fragments.
68. As a Platform Operator, I want one dashboard listing every Tenant with its deployment state, so that I know the fleet is healthy.
69. As a Platform Operator, I want to see booking requests that have gone unanswered for over 24 hours, so that I can nudge a client who is ignoring customers.
70. As a Platform Operator, I want to see each Site's last successful content publish, so that I can spot a broken publish pipeline.
71. As a Platform Operator, I want an uptime check per Site, so that I hear about an outage before the client does.
72. As a Platform Operator, I want to fix a bug once in the library and roll it to every Site, so that maintenance does not scale with client count.
73. As a Platform Operator, I want to hand a departing client their repository and a data export, so that I can offer a clean exit in the sales conversation.
74. As a Platform Operator, I want the manual DNS and email-verification steps printed for me during onboarding, so that I do not forget one.
75. As a Platform Operator, I want to see every Section in every Theme in one place, so that I can check a Theme before showing it to a client.

---

## Implementation Decisions

### Seams

Four primary seams. Everything else is a leaf. Prefer these over introducing new
ones; a new seam needs a reason in writing.

1. **`TenantRepository`** — the sole gateway to Firestore. Every read and write
   of Tenant data goes through it, it runs server-only under the Admin SDK, and
   it is the single place Tenant scoping is enforced. Nothing else in the
   codebase imports the Firestore SDK.
2. **`BookingProvider`** — the port both booking modules implement. The
   `BookingSection` component depends on this interface and never on a concrete
   implementation, so a Tenant's booking style is a config value.
3. **`SectionRegistry`** — the map from section `type` to component plus props
   schema. Rendering a page is a fold over a Composition against this registry.
   Adding a Section means registering an entry; it means nothing else.
4. **`availability`** — a *pure* module: `(rules, occupancy, service, staff,
   now, policy) -> Slot[]`. No I/O, no Firestore, no clock reads. This is the
   riskiest arithmetic in the product, and keeping it pure is what makes it
   inspectable and, later, testable without infrastructure.

Two thin seams, kept narrow deliberately: **`Notifier`** (one `send(message)`
call, Resend behind it) and **`themeTokens`** (Theme name to CSS custom
property declarations).

### Repository and deployment topology

- A pnpm + Turborepo monorepo. `packages/*` for the shared library, one
  `apps/<tenant>` per Site, one `apps/admin` shared across all Tenants.
- Each Site is a separate Vercel project pointed at its own app root. Deploy
  isolation without private npm publishing; Sites depend on the library by
  workspace reference.
- Next.js App Router, TypeScript, Tailwind v4. Firebase (Firestore + Auth) in an
  EU region. Hosting on Vercel.

### Data ownership and access

- One shared Firebase project. **All Tenant data nests under
  `tenants/{tenantId}/**`** — never top-level collections carrying a `tenantId`
  field, because that spreads the scoping obligation across every query forever.
- Tenant Admin identities carry a `tenantId` custom claim, set server-side at
  user creation. The Ops Console is gated on a separate `owner` claim.
- **Firestore is server-only.** All access is via the Admin SDK inside server
  actions and route handlers. Security rules are `allow read, write: if false`
  for every path. The browser talks to Firebase for Auth and nothing else.
  Rationale: a deny-all rule cannot be misconfigured, whereas a per-collection
  tenant rule can — and the failure mode is one salon reading another's customer
  contact details.

### Composition and content

- **Composition lives in git**, as a typed config file inside each Site's app:
  an ordered array of `{ type, variant, props }`. The Platform Operator owns
  layout; a Tenant cannot break their own page structure.
- **Content lives in Firestore** and is Tenant-editable: texts, images, services,
  prices, hours, staff, active Theme.
- Images in Firebase Storage, served through Next's image optimiser.

### Theming

- A Theme is a token set, not a palette: semantic colours in OKLCH (`surface`,
  `surface-raised`, `text`, `text-muted`, `accent`, `accent-contrast`, `border`,
  `success`, `danger`), a type pairing, a radius scale, a density scale, a shadow
  level. Emitted as CSS custom properties and consumed via Tailwind `@theme`.
- Five to six presets, each with light and dark variants. Personality axes are
  in scope (soft/rounded/airy versus sharp/dense), constrained to defined tokens.
- **Components never accept a colour prop.** They accept semantic intent —
  `variant="primary" | "subtle" | "ghost"` — and read tokens. A Tenant may
  override individual tokens; free-form CSS per Tenant is not permitted.

### Rendering and publishing

- Pages are statically generated. Saving in Tenant Admin calls that Site's
  revalidate webhook; the webhook URL and shared secret are stored on the Tenant
  document. Public traffic therefore causes zero Firestore reads.
- The booking widget is the single dynamic island on an otherwise static page. It
  fetches availability from a route handler with a short (~30s) cache.

### Booking — both modules

- Both ship in v1 behind `BookingProvider`; a Tenant config field selects one.
- **No Visitor accounts.** Guest booking only, with signed-token links for
  confirmation and cancellation.
- **Time invariant:** every instant is stored as a UTC timestamp; the Tenant's
  timezone lives on the Tenant document; all availability arithmetic happens in
  Tenant-local time via a real timezone library. Slots are generated in local
  time and then converted. No naive local date strings are stored anywhere.

### Booking — `BookingRequest`

- Visitor selects a Service and one or two preferred windows (a date plus
  morning / afternoon / evening) plus optional notes.
- Windows are filtered against Availability Rules, so a closed day or an
  after-hours window is never offered. The module does **not** consult Occupancy.
- Tenant confirms or declines from a signed link in the notification email, and
  the same request is actionable in Tenant Admin.

### Booking — `SlotBooking`

- **Capacity model:** Staff only. Rooms, chairs and equipment are not modelled.
- **Grid:** fixed 15-minute Cells, configurable per Tenant. A Service occupies
  `ceil(duration / cellSize)` contiguous Cells.
- **Staff selection:** default "any available" — availability is the union across
  Staff. An optional filter narrows to one person. A concrete Staff member is
  **pinned at write time**; "any" is never persisted.
- **Duration:** per Service, Tenant-configured, with an optional per-Staff
  override. There is no customer-facing duration-options concept — a 60- and a
  90-minute massage are two separate Services.
- **Reservation:** one Occupancy document per Staff member per date, holding the
  set of occupied Cell indices. Booking runs a Firestore transaction that reads
  the Occupancy document, verifies the required contiguous Cells are free, and
  writes the Booking plus the updated Occupancy together. The contention point
  is a single document per Staff member per day, which suits a business doing
  tens of bookings a day. Listing availability reads the same document, so no
  query is needed.
- **Anti-abuse:** a Booking is created as `pending_verification`, *holding* its
  Cells, and is finalised when the Visitor clicks an email link. Unverified holds
  expire after 15 minutes, released by the same cron that sends reminders.
  Request rate is limited by IP. Without this, an anonymous stranger can fill a
  real business's week.
- **Policy knobs, all per-Tenant:** buffer per Service (default 10 min), minimum
  lead time (12 h), maximum advance window (90 d), cancellation deadline (24 h).
- **Visitor self-service:** cancel only, plus a "book again" link. No self-serve
  reschedule.
- **Tenant Admin calendar:** day list on mobile, week grid on desktop, manual
  booking creation, block time, cancel, mark no-show, and an explicit move dialog
  that reuses the availability picker. No drag-and-drop.
- **Reminders:** Vercel Cron hourly, hitting a route handler that sends what is
  due. Idempotent — the Booking is marked reminded inside the same transaction,
  so an overlapping run cannot email a customer twice.

### Sections in v1

*Chrome* — Navbar (transparent-over-hero / solid / centred-logo), Footer,
LocaleSwitcher.
*Sections* — Hero (image / video / split), About, ServicesList, StaffGrid,
Gallery (masonry), Testimonials, FAQ, OpeningHours, MapContact, CTABand.
*Functional* — BookingRequest, SlotBooking, ContactForm.
*Non-visual, non-negotiable* — SEO metadata, `LocalBusiness` /
`HealthAndBeautyBusiness` JSON-LD, sitemap, robots, cookieless analytics.

`CookieConsent` is deliberately **absent**: analytics is cookieless (Vercel Web
Analytics), so no consent banner is legally required and none is shipped.

### Internationalisation

- `next-intl`. Path prefix with the default locale unprefixed: `/` is Estonian,
  `/en/…` is English.
- UI strings live in library dictionaries. Content fields are stored per locale
  with a fallback chain — an empty English field renders the Estonian value
  rather than a blank. Tenant Admin marks untranslated fields.

### Operations

- Platform Operator owns Vercel, Firebase and Resend. The Tenant owns their
  domain and adds one CNAME plus two TXT records (email DKIM/SPF).
- Transactional email via Resend, one account, per-Tenant verified sending
  domain, `Reply-To` set to the Tenant's real inbox so a customer's reply
  reaches the business.
- **One shared Tenant Admin** at the Platform Operator's own domain, Tenant
  resolved from the logged-in claim. No admin code is shipped in Site bundles.
- **Ops Console** inside the same application, gated on the `owner` claim. Per
  Tenant it surfaces: deployment state and last deploy, last successful
  revalidate, booking requests unanswered for over 24 hours, last content edit,
  and an uptime ping.
- **Provisioning script** (`pnpm new-client <slug>`): creates the Tenant
  document, seeds default Content and Theme, creates the admin user with its
  claim, scaffolds `apps/<tenant>`, creates the Vercel project, and prints the
  manual DNS and Resend verification steps.
- Contractual exit path: repository handover plus a Firestore export.

### Compliance

- Firestore in an EU region. Tenant is data controller, Platform Operator is
  processor; a DPA per Tenant.
- **No free-text "reason for visit" field**, deliberately, to keep the platform
  clear of health data.
- Bookings and their contact details are purged after a defined retention period.

---

## Testing Decisions

**The Platform Operator has decided against automated tests in v1.** No unit
tests, no integration tests, no end-to-end tests, no Storybook, no visual
showcase route, no CI quality gates. This section records that decision, what
replaces it, and what it costs — not a test plan.

What a good test would look like here, for whenever tests are added: it exercises
a seam's external behaviour, not its internals. A test for `availability` passes
rules, occupancy and a fixed `now`, and asserts on the returned slots — it never
reaches into how slots were computed. A test for `TenantRepository` asserts that
a read scoped to one Tenant cannot return another's documents.

Design choices made *in place of* tests, each removing a class of defect rather
than detecting it:

- **Deny-all security rules plus server-only Firestore access.** This is the
  substitute for rules tests. There is no per-collection rule to get wrong, so
  the cross-Tenant data-leak class is designed out rather than tested for.
- **`availability` as a pure function.** No I/O means its behaviour is
  determined entirely by its arguments, so it can be reasoned about by reading
  it, and tested later without any infrastructure.
- **Deterministic Occupancy documents.** Correctness of double-booking
  prevention rests on one Firestore transaction over one document, which is a
  small enough surface to review by eye.
- **Typechecking comes free.** `next build` runs `tsc` and fails the deploy on
  type errors, so type-level regressions are caught without any CI setup.
- **Idempotent cron handlers.** Reminder sending is marked inside the same
  transaction, so the duplicate-email class is designed out.

The cost, recorded honestly: **the booking transaction and the availability
arithmetic ship unverified.** If they are wrong, the symptom is a double-booked
slot or an appointment shifted by an hour across a daylight-saving boundary, and
the first party to notice is a real salon with two customers in the waiting room.
This is the largest residual risk in the project and it is accepted knowingly.

The highest seam to test first, if that position is ever revisited, is
`availability` — pure, no fixtures, and it covers the arithmetic that carries the
risk. Second is the reservation transaction against the Firestore emulator.

---

## Out of Scope

Payments and deposits · Google / Outlook / CalDAV calendar sync · recurring
appointments · waitlists · round-robin Staff assignment · multiple locations per
Tenant · SMS notifications · rooms and equipment as bookable resources ·
capacity-aware request windows ("Saturday morning is full") ·
drag-and-drop rescheduling in Tenant Admin · Visitor self-serve rescheduling ·
customer accounts and booking history · loyalty schemes · gift cards · blog ·
Instagram feed · GA4 and any consent banner · free-form page building by Tenants ·
self-serve Tenant signup · automated DNS provisioning · billing and invoicing ·
automated tests of any kind.

---

## Further Notes

### Known limitations to recognise at the sales stage

- **Staff-only capacity breaks for shared equipment.** A nail salon with three
  technicians and one pedicure spa will be over-booked by this model. Recognise
  that client before signing, not in production.
- **No calendar sync** is very likely the first feature request from any owner
  who already lives in Google Calendar.
- **`SlotBooking` assumes a single location.** A Tenant with two premises needs
  two Tenants, and therefore pays twice.

### Sequencing

The library plus Sections plus `BookingRequest` is a shippable product on its
own. `SlotBooking` is the larger half of the engineering and should follow behind
the same port, so that client #1 can go live while it is still being built.

### Scale assumption

Designed for one to three Tenants in the first year, on a monthly subscription.
The data model should not *prevent* self-serve signup later, but nothing is built
for it now. Decisions that would only pay off at thirty or three hundred Tenants
were deliberately declined.

### Issue tracker

This spec was written to a file because no issue tracker is configured in this
repository. To publish specs as tracked issues with triage labels, run
`/setup-matt-pocock-skills` and re-run `/to-spec`.
