# Modular Salon & Wellness Website Platform — implementation tickets

Source spec: `docs/specs/0001-modular-salon-platform.md` (spec 0001, v1).
Tickets are numbered in dependency order — blockers always have a lower number
than the tickets they block, so the list can be read top to bottom.

Work the **frontier**: any ticket whose blockers are all done. Several pairs are
genuinely parallel (07 alongside 06, 09 alongside 06–08, 11 alongside 05–10).

## Milestones

| After | You have |
|---|---|
| 05 | A themed, composed, content-driven, bilingual Site. No Tenant can edit it yet. |
| 10 | A complete public Site a Visitor can trust and Google can find. |
| 15 | A Tenant who maintains their own Site without the Platform Operator. |
| **18** | **The spec's first shippable product** — library, Sections and `BookingRequest`. Client #1 can go live here while `SlotBooking` is still being built. |
| 24 | Self-service booking with a real calendar the Tenant runs their day from. |
| 28 | A platform the Platform Operator can operate, onboard onto and be left. |

## Tickets

| # | Title | Blocked by |
|---|---|---|
| 01 | [Monorepo skeleton](issues/01-monorepo-skeleton.md) | — |
| 02 | [Theme token contract](issues/02-theme-token-contract.md) | 01 |
| 03 | [Section Registry and Composition](issues/03-section-registry-composition.md) | 02 |
| 04 | [`TenantRepository` and Content](issues/04-tenant-repository-content.md) | 03 |
| 05 | [i18n and locale fallback](issues/05-i18n-locale-fallback.md) | 04 |
| 06 | [Chrome and hero Sections](issues/06-chrome-and-hero-sections.md) | 05 |
| 07 | [Commercial Sections](issues/07-commercial-sections.md) | 05 |
| 08 | [Trust Sections](issues/08-trust-sections.md) | 06 |
| 09 | [`Notifier` and ContactForm](issues/09-notifier-and-contact-form.md) | 05 |
| 10 | [SEO, structured data, analytics](issues/10-seo-jsonld-analytics.md) | 07, 08 |
| 11 | [Admin shell and auth](issues/11-admin-shell-auth.md) | 04 |
| 12 | [Content editing and publish](issues/12-admin-content-editing-publish.md) | 11, 05 |
| 13 | [Image management](issues/13-admin-image-management.md) | 12, 08 |
| 14 | [Services and Staff](issues/14-admin-services-and-staff.md) | 12 |
| 15 | [Theme presets and picker](issues/15-theme-presets-and-picker.md) | 12, 06, 07, 08 |
| 16 | [Availability Rules and policy](issues/16-admin-availability-rules-policy.md) | 14 |
| 17 | [`BookingProvider` port and request submission](issues/17-booking-provider-port-and-request-submit.md) | 16, 09 |
| 18 | [Request confirm and decline](issues/18-booking-request-confirm-decline.md) | 17 |
| 19 | [Availability slot generation](issues/19-availability-slot-generation.md) | 16, 17 |
| 20 | [Reservation transaction and verification](issues/20-slot-reservation-transaction.md) | 19 |
| 21 | [Visitor cancel and rebook](issues/21-visitor-cancel-and-rebook.md) | 20 |
| 22 | [Cron: reminders and hold expiry](issues/22-cron-reminders-and-hold-expiry.md) | 20 |
| 23 | [Calendar views](issues/23-admin-calendar-views.md) | 20 |
| 24 | [Calendar actions](issues/24-admin-calendar-actions.md) | 23 |
| 25 | [Ops Console fleet dashboard](issues/25-ops-console-fleet-dashboard.md) | 12, 18 |
| 26 | [Theme gallery](issues/26-theme-gallery-ops-console.md) | 15 |
| 27 | [Provisioning script](issues/27-provisioning-script.md) | 15, 11 |
| 28 | [Retention purge and exit path](issues/28-retention-purge-and-exit.md) | 22, 27 |
| 29 | [Booking flow accessibility pass](issues/29-booking-flow-accessibility-pass.md) | 18, 21, 24 |

## Sequencing decisions worth knowing about

**i18n lands at 05, before any real Section is built.** Per-locale content
touches every Section's content read. Retrofitting it after tickets 06–08 would
be a wide refactor across the exact code that has no tests.

**Opening hours have one source of truth from ticket 07 onward.** The
OpeningHours Section, the structured data in 10 and the booking engine in 16–19
all read Availability Rules. There is no separate opening-hours content field
anywhere in the schema, by design.

**`availability` has no ticket of its own.** Its rules-only path lands in 17 and
its slot generation in 19. Without tests, a standalone pure-module ticket
delivers nothing anybody can look at. Both tickets require a written manual
verification walk-through instead — the spec names this the riskiest arithmetic
in the product and accepts shipping it unverified, so the walk-throughs are the
only evidence there will be.

**One cron, on the admin app, not one per Site.** Ticket 22 establishes it;
tickets 25 and 28 add jobs to the same handler. A schedule per Site is N things
to create at provisioning and N places for one to be silently missing.

**Ticket 26 sits against the spec's own words.** Testing Decisions rules out a
"visual showcase route"; story 75 asks to see every Section in every Theme.
Ticket 26 reads the ban as aimed at test infrastructure and builds the operator
tool behind the `owner` claim instead. Nothing depends on it — delete it and
close story 75 as declined if that reading is wrong.

## Deviations from the spec recorded in the tickets

- **Ticket 08 rules out a Google Maps embed.** A Maps iframe sets third-party cookies, which would defeat the deliberate decision to ship no consent banner. A cookieless static map plus directions deep links instead.
- **Ticket 14 adds a service list to the Staff record.** The spec does not name it, but "any available staff" is wrong without it — the union across staff would offer the receptionist for a haircut.
- **Ticket 20 stores occupancy as entries rather than a bare set of cell indices.** Cancelling, expiring a hold and moving an appointment all need to know which record owns a cell, and an index set cannot answer that without the query the model exists to avoid.
