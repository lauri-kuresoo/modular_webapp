# 14: Tenant manages its services and its people

**What to build:** A Tenant adds a service, sets its duration and price,
retires an old one, adds a new stylist, says which services that stylist
performs, and gives a slower colleague a longer duration for the same service.
The Site's price list and staff grid match reality after publishing, and the
records the booking engine needs exist.

**Blocked by:** 12 (Content editing and publish).

**Status:** ready-for-agent

## Design and technology choices

**Services and Staff are records with identity, edited as collections** rather
than as fields in a content document. Bookings, requests and occupancy all
reference them by id for years, so the id has to be stable and the record has to
outlive its removal from the Site.

**Retirement is a flag, never a delete.** The admin offers "retire", which hides
the record from the Site and from new bookings while keeping it resolvable. If
the platform allowed a hard delete, a Tenant looking at last spring's calendar
would see appointments for a service that no longer has a name. Make the button
say "retire", not "delete", and explain what it does.

**Which staff perform which service is an explicit list on the Staff record.**
The spec does not name this, but "any available staff" is wrong without it — the
union across staff would offer the receptionist for a haircut. Store the service
ids on the Staff member, since that is the direction the Tenant thinks in when
onboarding a new person, and it is the direction ticket 19 reads it.

**Per-staff duration overrides live on the Staff record, keyed by service.** A
staff member is the thing that is slower, so the override belongs to the person.
The resolution rule is: staff override, else the service's duration. Write that
rule down once, in the module ticket 19 consumes, and never re-derive it at a
call site.

**No customer-facing duration options.** A 60-minute and a 90-minute massage are
two separate Services, per the spec. Say so in the admin's help text, because
the first Tenant will ask for a dropdown, and the answer being "two services" is
a design decision worth stating rather than an omission worth patching.

**Buffer can be overridden per service, defaulting from the Tenant.** A
blow-dry needs less recovery time than a spray tan. The knob exists here; the
Tenant-level default is set in ticket 16.

**Price is integer minor units, currency is on the Tenant.** Established in
ticket 07; the admin's input takes a decimal amount in the Tenant's currency and
converts on the way in. Round explicitly and show the Tenant the stored value
back, so nobody discovers a 44,99 that was meant to be 45,00.

**Ordering is an explicit integer with the same up/down-plus-drag treatment as
ticket 13.** A Tenant's price list order is a commercial decision — the service
they want to sell goes first — so never sort it for them.

**Category is a free string on the service with autocomplete from existing
values.** A managed category collection is more correct and more work than three
Tenants justify; autocomplete stops "Hair" and "hair" from becoming two
headings.

**Localised name and description, with the ticket 05 fallback.** A retired
service still needs its Estonian name to render in a year-old booking.

**Validate what the booking engine will assume.** Duration and buffer positive
integers, duration a multiple of the cell size or explicitly reconciled with it,
price non-negative, at least one active staff member per active bookable
service. Refuse at the edge — the availability arithmetic in ticket 19 is the
riskiest code in the product and it should never have to defend itself against a
zero-minute service.

**Warn, do not block, when a change affects existing bookings.** Retiring a
service or a staff member with future appointments is legitimate — the person
left — but the Tenant must be told how many appointments are affected and which,
so they can call those customers. Silently retiring someone with next week full
is how a business finds out on the day.

## Acceptance criteria

- [ ] Services and Staff are managed as collections of identified records, created, edited and reordered from the admin
- [ ] Retiring hides a record from Site and from new bookings while keeping it resolvable by id; no hard delete exists
- [ ] Each Staff record carries the list of services they perform, and the booking flows only ever offer a staff member for a listed service
- [ ] Per-staff duration overrides are stored on the Staff record keyed by service, with one documented resolution rule (override, else service duration) implemented in one place
- [ ] A per-service buffer override exists and falls back to the Tenant default
- [ ] Prices are entered as decimals and stored as integer minor units, with the stored value shown back to the Tenant
- [ ] Explicit ordering with drag plus keyboard-operable move controls
- [ ] Category is a free string with autocomplete over existing values
- [ ] Names and descriptions are localised with the Estonian fallback
- [ ] Validation rejects non-positive durations and buffers, negative prices, and an active bookable service with no active staff able to perform it
- [ ] Retiring a service or staff member with future appointments warns with the count and a list, and proceeds only on confirmation
- [ ] After publishing, the Site's services list and staff grid match the admin
