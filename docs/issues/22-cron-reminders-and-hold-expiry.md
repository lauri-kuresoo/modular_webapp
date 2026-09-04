# 22: The scheduled work — reminders, and letting go of stale holds

**What to build:** A customer gets an email the day before their appointment, and
never gets two. Slots held by someone who never clicked their verification link
come back on the market. Both run on a schedule, for every Tenant, from one
place.

**Blocked by:** 20 (Reservation transaction and verification).

**Status:** ready-for-agent

## Design and technology choices

**One hourly cron on the admin application, not one per Site.** The admin is a
single deployment that already holds the Admin SDK and can enumerate every
Tenant through the repository. A cron per Site means N schedules to create at
provisioning, N to remember when a Tenant leaves, and N places for a schedule to
be quietly missing — and a missing reminder cron is invisible until a customer
does not turn up. This is the one piece of cross-Tenant machinery in the
platform and it belongs where the Tenant list lives.

**Authenticate the endpoint.** Check the platform's cron secret from the request
header and reject anything else. The handler sends email and mutates bookings;
an open URL that does that is not acceptable even at three Tenants.

**Two jobs, one handler, in this order: release holds, then send reminders.**
Releasing first means a reminder is never sent for a booking that is about to be
expired out from under it.

**Hold release is a transaction per booking, over the same occupancy document as
ticket 20.** Find bookings still `pending_verification` whose hold expiry has
passed; move each to `expired` and remove its entry from occupancy, together.
Never delete the booking — an expired attempt is the trace of a customer who
tried and got distracted, and it is useful when they phone.

**Reminders are marked inside the transaction that decides to send them, and
sent after it commits.** This is the whole idempotency argument. Two overlapping
runs both read the booking; only one commits the mark; only that one sends. The
failure mode is a missed reminder if the send fails after the commit — which is
the right way round, because a customer emailed twice about the same appointment
loses confidence in the business, and a customer emailed zero times is the
situation they were in before the platform existed. Record the send failure so
the Tenant can see it.

**The reminder window is computed in the Tenant's local time.** "The day before"
means a local morning, not "24 hours before the UTC instant". Select bookings
whose local appointment date is tomorrow and which have not been reminded, and
send at a defined local hour — which means the hourly run has to ask, per Tenant,
whether it is currently that hour there. This is deliberate: a customer getting
a reminder at 3am has been reminded badly.

**Work in bounded batches with a cursor.** A single Tenant with a busy day must
not push the run past the platform's function timeout and starve the Tenants
after it. Process up to a fixed number of records per job per run, record where
you stopped, and let the next run continue — hourly runs give plenty of
headroom. Log when a batch is truncated rather than truncating silently.

**Every job is safe to run twice and safe to run late.** Assume the schedule
will be missed, doubled, and retried, because it will be. No job may depend on
having run at a particular time; each one derives what to do from current state.

**Record the run.** Started, finished, per-job counts, and any failures, stored
where ticket 25 can display them. A cron that has silently not run for a week is
exactly the class of failure the Ops Console exists to catch, and it can only
catch it if the run leaves a trace.

**The uptime ping belongs to this handler too**, added in ticket 25 — noted here
so the handler is structured as a list of jobs from the start rather than two
inlined blocks.

**Manual verification, since there are no tests.** Create a hold, let it expire,
run the handler, confirm the slot returns to availability. Create a booking for
tomorrow, run the handler twice in a row, confirm exactly one email. Run the
handler with the clock arranged either side of a clock change and confirm the
reminder hour is still local. Record all three in the repo.

## Acceptance criteria

- [ ] A single hourly schedule on the admin application iterates all Tenants through the repository; no Site has its own schedule
- [ ] The endpoint rejects any request without the platform cron secret
- [ ] Hold release runs before reminder sending within a run
- [ ] Expired holds move to `expired` and have their occupancy entry removed in one transaction per booking; the booking record is retained
- [ ] A released slot is immediately available again from the availability endpoint
- [ ] The reminder mark is written inside the transaction that selects the booking, and the email is sent only after that transaction commits
- [ ] Two overlapping runs over the same due booking result in exactly one email
- [ ] A send failure after a successful mark is recorded on the booking and visible in the admin
- [ ] Reminder eligibility and send hour are computed in the Tenant's local time, verified either side of a clock change
- [ ] Each job processes a bounded batch with a cursor, and a truncated batch is logged rather than silent
- [ ] Running the handler twice in succession, or hours late, produces correct results with no duplicate side effects
- [ ] Each run records start, finish, per-job counts and failures in a place the Ops Console can read
- [ ] The handler is structured as an extensible list of jobs
- [ ] The three manual verifications — hold expiry, double run, clock change — are recorded in the repo
