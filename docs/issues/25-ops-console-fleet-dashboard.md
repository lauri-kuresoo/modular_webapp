# 25: One screen that says whether the fleet is healthy

**What to build:** The Platform Operator opens one page and sees every Tenant
with its deployment state, when its content last published successfully, whether
it is answering HTTP, when the Tenant last edited anything, and whether any
booking request has been sitting unanswered for over a day. Problems sort to the
top with the reason spelled out.

**Blocked by:** 12 (Content editing and publish), 18 (Request confirm and decline).

**Status:** ready-for-agent

## Design and technology choices

**Inside the same admin application, gated on the `owner` claim**, checked
server-side through the same helper pattern as ticket 11 — a `requireOwner()`
that is the only way to obtain cross-Tenant access. Cross-Tenant reads are the
one thing the platform's whole data design is arranged to prevent, so the single
place they are legitimate needs to be obvious, narrow and unmistakable in the
code.

**Every signal is read from stored state, not gathered at render.** The page must
not fan out to N Vercel API calls and N HTTP pings while the Platform Operator
waits — one slow Site would hang the dashboard, which is precisely when it is
being looked at. The cron from ticket 22 collects; this page displays.

**The signals and where each comes from:**

- *Last successful publish* — `lastPublishAt` and `lastPublishStatus`, written by ticket 12 on every attempt.
- *Last content edit* — the editor and timestamp already recorded on content documents.
- *Unanswered requests over 24 hours* — a query over requests by status and creation time, derived not stored (ticket 18).
- *Uptime* — the result of the cron's ping against each Site's health endpoint (ticket 10), stored on the Tenant document with its timestamp.
- *Deployment state and last deploy* — the Vercel REST API, fetched by the cron and cached, with the project id stored on the Tenant document at provisioning.

**The uptime ping is a new job in ticket 22's handler**, hitting each Site's
health endpoint hourly and recording status, latency and time. Add it here rather
than in ticket 22 so it lands with the screen that consumes it. A ping result
older than a couple of hours is itself a signal — it means the cron is not
running, which is worse than a Site being down, and the dashboard must show that
distinctly rather than displaying a stale green.

**Also surface the cron's own run record** from ticket 22: last run, duration,
counts, failures. The cron sends reminders and expires holds; a cron that
silently stopped a week ago is the most expensive invisible failure in the
platform.

**Traffic-light per Tenant, with the reason as text.** The colour is for
scanning, the sentence is what makes it actionable — "publish failed 3 hours
ago: webhook returned 401" tells the Platform Operator what to do, a red dot
does not. Sort worst first so the healthy majority is below the fold.

**Define what each level means, and write it on the page.** Red for down, publish
failing, or the cron stale. Amber for a request unanswered over 24 hours, a
deployment error on the latest deploy, or no content edit in a long while. Green
for everything current. Ambiguous thresholds get ignored, and an ignored
dashboard is worse than none.

**No Tenant data beyond what the signal needs.** The console shows that a request
has gone unanswered for 30 hours and which Tenant, not the customer's name,
email or phone. The Platform Operator's job here is to nudge the client, and the
console should not be a route around the platform's own data-minimisation
promise. This is a deliberate limit — write it down, because the temptation to
add "just the customer name" will come up.

**Read-only in v1, with one exception: a manual re-ping.** No editing another
Tenant's content, no cancelling their bookings, no impersonation. Every one of
those is a support workflow that does not exist yet and a privacy question that
has not been answered.

**A per-Tenant detail view** holding the same signals with a short history — the
last several publishes, the last several pings — so an intermittent problem is
visible as a pattern rather than as a single current value.

**Deep links out to the real tools**: the Vercel project, the Site itself, the
Firestore console for that Tenant's subtree. The console's job is to tell the
Platform Operator where to look, not to reimplement Vercel.

## Acceptance criteria

- [ ] The console lives in the admin application, gated on the `owner` claim through a server-side helper that is the only route to cross-Tenant access
- [ ] Every signal renders from stored state; the page makes no per-Tenant call to Vercel or to a Site at render time
- [ ] Per Tenant the page shows deployment state and last deploy, last successful publish with failure reason, last content edit, unanswered requests over 24 hours, and the latest uptime result
- [ ] An hourly uptime ping job is added to the cron handler, recording status, latency and timestamp per Tenant
- [ ] A stale ping result is shown as "cron not running" rather than as a healthy state
- [ ] The cron's own last run, duration, counts and failures are displayed
- [ ] Each Tenant has a traffic-light status accompanied by a sentence naming the specific problem, sorted worst first
- [ ] The meaning of each status level is documented on the page itself
- [ ] No customer name, email, phone or booking note is displayed anywhere in the console, and this limit is recorded in the repo
- [ ] The console is read-only apart from a manual re-ping; no cross-Tenant content, booking or impersonation action exists
- [ ] A per-Tenant detail view shows a short history of publishes and pings
- [ ] Each Tenant row deep-links to its Vercel project, its live Site and its Firestore subtree
