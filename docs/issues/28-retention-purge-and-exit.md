# 28: Personal data does not accumulate forever, and a client can leave

**What to build:** Customer contact details are scrubbed from bookings and
requests once the retention period has passed, automatically, while the Tenant
keeps their appointment history. And the Platform Operator can hand a departing
client their repository and a complete data export — the clean exit that makes
the sales conversation easier.

**Blocked by:** 22 (Cron), 27 (Provisioning).

**Status:** ready-for-agent

## Design and technology choices

**The purge is a field-level scrub, not a document delete.** Remove name, email,
phone and the note; keep the appointment — its date, service, staff member,
duration, price and status. The Tenant's own business history is legitimately
theirs and deleting it would destroy the record of a year's trade. What the
platform has no continuing purpose for is the identity of the person, so that is
what goes. Replace rather than blank, so a scrubbed record is unmistakably
scrubbed rather than looking like a booking somebody forgot to fill in, and
stamp when it happened.

**One retention period on the Tenant document**, set at provisioning with a
platform default, and it must match what the Tenant's own privacy notice and the
DPA say. This number is a legal commitment, not a configuration preference —
record where it is also written down, because if the two disagree the platform
is the one that is wrong.

**It runs as another job in ticket 22's handler.** Daily is sufficient; the
hourly handler can skip it outside a chosen hour. Bounded batches with a cursor,
same as every other job there, so a Tenant with a long history cannot time the
run out.

**Idempotent by construction:** select records past the period that are not yet
scrubbed, scrub, stamp. Running twice does nothing the second time. Never
depends on having run yesterday, because at some point it will not have.

**Blocks and manual bookings without contact details are excluded** — there is
nothing to scrub and they should not be touched or counted.

**Log what was scrubbed, in counts and not in content.** The audit record of a
data-protection process must not itself be a copy of the data it removed. Counts
per Tenant per run, visible in the Ops Console.

**Verify against a real record before trusting it.** Create a booking, move its
timestamps past the retention period, run the job, and confirm the contact fields
are gone from the document, from the calendar views, from the requests list, and
from anywhere else they were denormalised. Denormalisation is the trap here: if a
customer name was copied onto another document for convenience, the scrub must
find it too. Enumerate every place contact details are written before writing the
job — that enumeration is the actual work of this ticket.

**Storage holds no visitor uploads**, so there is nothing to purge there. State
that, so the next person does not have to work it out.

**Exit is a script plus a runbook.** `pnpm export-tenant <slug>` writes the
Tenant's entire Firestore subtree as JSON, plus every Storage object belonging to
it, plus a manifest — a format the client's next developer can actually read,
not a proprietary backup. Human-readable JSON matters: the point is a credible
clean exit, and an export nobody can open is not one.

**Repository handover is documented, not scripted.** Extracting one app plus the
library it depends on from a monorepo is git surgery with judgement in it, and
it happens rarely. Write the runbook: which directories, which environment
variables, what the client must recreate on their own Vercel and Firebase, what
they lose (the shared library's future fixes) and what they gain. A script that
does this badly is worse than a checklist that does it correctly.

**Also document the offboarding side effects** the runbook must cover: remove the
Site from the roll-out command's target list, remove it from the uptime ping,
revoke the admin user, and decide with the client when the platform's copy of
their data is deleted. An offboarded Tenant still being pinged hourly and still
appearing red on the dashboard is the untidy end state to avoid.

**The DPA and the controller/processor split belong in the repository too** —
the Tenant is the controller, the Platform Operator the processor. Note where
the signed agreements live, and that the retention period stated there must
match the one on the Tenant document.

## Acceptance criteria

- [ ] A retention job scrubs name, email, phone and note from bookings and requests past the retention period, replacing rather than blanking them and stamping when it happened
- [ ] Appointment date, service, staff, duration, price and status survive the scrub
- [ ] The retention period is a field on the Tenant document with a platform default, and the repo records where the same number is committed to contractually
- [ ] The job runs from the existing cron handler in bounded batches with a cursor, and running it twice changes nothing the second time
- [ ] Blocks and contact-less manual bookings are excluded from the purge
- [ ] Every location where contact details are written is enumerated in the repo, and the scrub covers all of them including denormalised copies
- [ ] Scrub activity is logged as counts only, never as content, and surfaces in the Ops Console
- [ ] A real booking aged past the period is verified scrubbed in the document, the calendar views and the requests list
- [ ] The repo states that no visitor-uploaded files exist and Storage needs no purge
- [ ] `pnpm export-tenant <slug>` produces human-readable JSON of the Tenant subtree, all associated Storage objects, and a manifest
- [ ] A repository handover runbook documents which directories move, which environment variables are needed, what the client must recreate, and what they lose
- [ ] The runbook covers offboarding side effects: removal from roll-out targets and uptime pings, admin user revocation, and the agreed deletion of the platform's copy
- [ ] The controller/processor split, the location of signed DPAs, and the requirement that the contractual and configured retention periods match are recorded in the repo
