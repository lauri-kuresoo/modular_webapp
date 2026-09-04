# 11: Tenant Admin shell — log in and be resolved to one Tenant

**What to build:** A Tenant goes to the Platform Operator's admin domain, logs
in with an email and a password, and lands on a page that shows their own
business and nothing else. A Platform Operator with the owner claim sees an
additional entry point. No admin code ships in any Site bundle.

**Blocked by:** 04 (`TenantRepository` and Content).

**Status:** ready-for-agent

## Design and technology choices

**One shared admin application at the Platform Operator's own domain**, with the
Tenant resolved from the logged-in identity. Not an admin per Site: N admins
means N deployments to patch and N places for admin code to leak into a public
bundle.

**The session pattern, which is the important decision in this ticket.** Firebase
Auth's client SDK is used only to exchange an email and password for an ID
token. That token is immediately posted to a route handler which verifies it
with the Admin SDK, mints a session cookie, and sets it `httpOnly`, `Secure`,
`SameSite=Lax`. From then on every authorisation decision is made server-side
from that cookie. The browser holds no Firebase session it could use to talk to
Firestore directly — which is what keeps the deny-all rules from ticket 04 from
being an inconvenience the implementation routes around.

**Claims are set server-side only, at user creation.** `tenantId` on every admin
user, plus `owner` on Platform Operator accounts. Claims are the authoritative
scoping input; nothing reads a tenant id from a query parameter, a form field or
a subdomain.

**Middleware is a redirect, not a security boundary.** It may bounce an
unauthenticated visitor to the login page for the sake of the experience, but
every server action and every route handler independently calls a
`requireTenant()` helper that verifies the session cookie and returns the
scoped repository from ticket 04. If authorisation lives only in middleware, one
route added outside the matcher is an unauthenticated write. Make the helper the
only way to obtain a repository in admin code, so forgetting it means having
nothing to call.

**Verify with revocation checking on sensitive operations.** Session cookie
verification can optionally hit the auth backend to check whether the session was
revoked. Use the cheap local check on page loads and the revocation check on
mutations, so disabling a departing employee's account takes effect on anything
that matters.

**A short session lifetime with silent renewal.** Salon owners use this from a
phone between clients; a two-week session is the right usability call, paired
with revocation checking on mutations so it stays safe.

**Password reset uses Firebase's built-in flow** in v1 rather than routing
through the `Notifier`. It works, it is secure, and rebuilding it earns nothing.
Note the inconsistency — this is the one email the platform sends that does not
come from the Tenant's domain — and leave it.

**The admin is not themed per Tenant.** It uses one fixed, high-contrast, dense
neutral theme. The admin is the Platform Operator's product; rendering it in a
Tenant's soft pastel preset would make a data-dense calendar harder to read for
no benefit. Reuse the token mechanism from ticket 02, with a single fixed admin
preset.

**Design for the phone first.** The primary stated use is "block off next
Tuesday afternoon from my phone, between clients". Every admin ticket after this
one inherits the layout shell built here, so get the mobile navigation and
touch target sizes right now.

## Acceptance criteria

- [ ] `apps/admin` exists as a separate deployment at the Platform Operator's domain; no admin code appears in any Site bundle
- [ ] Email and password login works; the client SDK is used only to obtain an ID token, which is exchanged server-side for an `httpOnly`, `Secure`, `SameSite=Lax` session cookie
- [ ] After login the browser holds no usable Firebase credential for Firestore
- [ ] `tenantId` and optional `owner` custom claims are set server-side; no code path derives a tenant id from a request parameter, form field or hostname
- [ ] A `requireTenant()` helper is the only way admin code obtains a repository, and it verifies the session on every server action and route handler independently of middleware
- [ ] Mutations verify the session with revocation checking; revoking a session blocks the next mutation
- [ ] Logging in shows the Tenant's own business name and no data belonging to another Tenant
- [ ] An owner-claimed account additionally sees an Ops Console entry point (the console itself is ticket 25)
- [ ] Password reset works via Firebase's built-in flow, and the deviation from Tenant-domain sending is noted in the repo
- [ ] The admin renders in one fixed neutral theme and is usable one-handed on a phone
