# 10: Search presence — metadata, structured data, sitemap, analytics

**What to build:** Someone searching for the service and the town can find the
business, and the search result itself shows opening hours, address and phone
number so they can act without opening the site. The Platform Operator can see
traffic without a consent banner, and has a health endpoint to ping.

**Blocked by:** 07 (Commercial sections), 08 (Trust sections).

**Status:** ready-for-agent

## Design and technology choices

**Metadata is generated per page per locale from Content**, not hardcoded and
not hand-written per Tenant in the Composition. Title, description, Open Graph
and Twitter cards, and a per-Tenant title template. A Tenant editing their
business name in ticket 12 should change the page title on the next publish.

**Structured data uses `HealthAndBeautyBusiness`** — a subtype of
`LocalBusiness` — because it is more specific and both salons and massage
practices fit it. Emit `name`, `address` as a structured postal address, `geo`
from the stored coordinates, `telephone`, `email`, `url`, `image`, `priceRange`,
`sameAs` for social profiles, and `openingHoursSpecification` derived from the
same Availability Rules that drive ticket 07 and the booking engine. Hours in
three places that could disagree is the failure this avoids.

**Build the JSON-LD as a typed object and serialise it.** Never assemble it as a
template string: an unescaped apostrophe in a Tenant's business name silently
invalidates the whole block, and there is no test that will catch it. Type the
object against the schema shape so a missing required property is a build error.

**Also emit `FAQPage` from the FAQ Section and `Service` entries from the
services list**, both derived from the same content the Sections render. Rich
results for FAQs and prices are the highest-value thing on this page for a small
business, and they cost nothing extra once the content is already structured.

**Validate by hand and record it.** With no tests, paste the rendered output
into Google's Rich Results Test once per structure type and note in the repo
that it passed. This is the manual gate that replaces the test you are not
writing.

**Sitemap and robots are generated, per-locale, with alternates.** Every page in
both locales, each entry listing its counterpart, matching the `hreflang` links
from ticket 05. Robots allows everything on production and disallows everything
on preview deployments — an indexed preview URL competing with the real domain
is a genuine and common own goal.

**Open Graph images generated at build.** Compose them from the Tenant's hero
image and business name using the framework's image generation at build time,
not at request time. Static means no cold-start latency when a link is pasted
into a chat, which is exactly when it matters.

**Analytics is Vercel Web Analytics, and it stays cookieless.** This is the
premise that lets the platform ship no consent banner. Do not add anything else
here — no GA4, no Meta pixel, no session recording — and write that constraint
next to the analytics setup so a future ticket does not casually break it.

**A health route lands in this ticket.** A cheap endpoint that confirms the app
is serving and reports the build's commit and Tenant id, with no Firestore read
so it cannot fail for a data reason. Ticket 25's uptime ping and ticket 27's
provisioning smoke check both need it, and it belongs with the other
non-visual, non-negotiable furniture.

## Acceptance criteria

- [ ] Title, description, canonical, Open Graph and Twitter metadata are generated per page and per locale from Tenant content
- [ ] `HealthAndBeautyBusiness` JSON-LD is emitted with address, geo, telephone, email, url, image, priceRange and opening hours derived from Availability Rules
- [ ] `FAQPage` and `Service` structured data are emitted from the same content the Sections render
- [ ] All structured data is built as a typed object and serialised, never string-concatenated; a Tenant name containing quotes or apostrophes still produces valid output
- [ ] Each structure type has been checked in Google's Rich Results Test and the result is recorded in the repo
- [ ] Sitemap and robots are generated with per-locale alternates; preview deployments disallow indexing and production allows it
- [ ] Open Graph images are generated at build time from Tenant content
- [ ] Vercel Web Analytics is enabled, sets no cookies, and the cookieless constraint is documented beside it
- [ ] A health endpoint returns build commit and Tenant id without touching Firestore
