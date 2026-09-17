# 05: Estonian by default, English at `/en`, with a fallback chain

**What to build:** The Site serves Estonian at `/` and English at `/en/…`. A
Visitor can switch between them and stay on the same page. A Content field with
no English value renders the Estonian one rather than a blank, and the platform
can report which fields are missing a translation so ticket 12's editor can
flag them.

**Blocked by:** 04 (`TenantRepository` and Content).

**Status:** ready-for-agent

**Build status:** done

## Design and technology choices

**This lands before the Section build-out on purpose.** Per-locale content
touches every Section's content read. Doing it now means Sections in tickets
06–08 are locale-aware by construction; doing it after means editing all of them
and hoping none was missed — a wide refactor across the exact code that has no
tests.

**`next-intl` with the default locale unprefixed.** `/` is Estonian, `/en/…` is
English, configured through the "as needed" prefix strategy. Rationale from the
spec: the Tenant's own customers are Estonian, and an unprefixed root is the
canonical URL they will link to and Google will index.

**Two string populations, handled differently.**

- *UI strings* — button labels, form errors, "next available date" — live in
  dictionaries in the library, one file per locale, with typed keys so a missing
  key is a type error rather than a rendered `booking.submit`.
- *Content strings* — the Tenant's own words — live in Firestore per locale.

Do not let Tenant content leak into dictionaries or UI strings into Firestore;
the first makes a typo a deploy, the second makes a label a Tenant's problem.

**Make Estonian required at the type level.** A localised field is a map from
locale to string in which the Estonian key is required and the others optional.
The fallback chain is then `requested → et`, and it always terminates in a real
string. This is the whole guarantee behind "a half-translated site is never a
broken site", and it is worth encoding in the type rather than in a runtime
default, because the type version cannot be forgotten:

```
type LocalizedText = { et: string; en?: string }
```

**One resolver, used everywhere.** A single function takes a localised field and
the active locale and returns a string. Sections never index the map directly —
if they do, the fallback becomes optional behaviour and some Section will render
blank.

**Missing-translation detection is a library helper, not admin code.** A function
that walks a content document against its schema and returns the fields missing
a given locale. It lives with the schemas so it stays correct as fields are
added; the admin in ticket 12 just renders its output.

**Both locales are statically generated.** Locale becomes a route segment
parameter enumerated at build. No runtime negotiation, no middleware redirect on
first visit based on `Accept-Language` — a Visitor who lands on the Estonian
page and wants English uses the switcher. Automatic redirection breaks caching
and surprises people who bookmarked a URL.

**SEO correctness is part of this ticket, not ticket 10.** Per-locale canonical
URLs and reciprocal `hreflang` links including `x-default`. Getting this wrong
means Google treats the two locales as duplicate content, which undermines the
one story the Tenant cares most about.

**The switcher preserves the path.** Switching from `/teenused` goes to
`/en/services`, not to `/en`. If localised path segments are in scope, the route
mapping belongs in the i18n config so it is declared in one place; if they are
not, keep identical segments across locales and say so — but decide now, because
retrofitting localised slugs later changes every URL you have published.

## Acceptance criteria

- [ ] `/` serves Estonian and `/en/…` serves English, both statically generated
- [ ] UI strings come from typed library dictionaries; a missing key is a build error
- [ ] Content fields are stored per locale with Estonian structurally required, and every Section reads them through one shared resolver
- [ ] An empty English field renders the Estonian value; no Section can render a blank because it bypassed the resolver
- [ ] A helper reports which fields of a content document lack a given locale
- [ ] Per-locale canonical and reciprocal `hreflang` links (including `x-default`) are emitted
- [ ] A `LocaleSwitcher` in the chrome switches locale while staying on the equivalent page
- [ ] The decision on whether path segments are localised is recorded in the repo
- [ ] No `Accept-Language` based redirect exists

## Build log

Merged to `main` as `db225e9`, branch `ticket/05-i18n-locale-fallback` tip `9a3ccae`.

Three implementer rounds and three verification passes. The first implementer's
process was killed by a watchdog mid-work; its output was rescued as `1f1f6bd`
and finished by a second.

Defects found in review, none of which `tsc`, lint or the build caught:

- **The 404 lost its document.** Moving the root layout under `[locale]` left
  `/_not-found` with Next's synthesised bare layout — no `lang`, no Theme, no
  fonts, no `color-scheme`. Reached by every unmatched URL and, because the
  proxy matcher excludes dotted paths, by `/favicon.ico` and `/robots.txt` too.
  Fixed with `app/global-not-found.tsx` plus a shared `SiteDocument`; both
  simpler remedies were reproduced as unworkable against Next's own source.
- **Four CSS rules generated from doc-comment prose** (`.invisible`, `.visible`,
  `.absolute`, `.static`), then a fifth from the fix's own comment. Fourth and
  fifth occurrences of this class on this project.
- **The build inherited the build machine's timezone.** next-intl defaulted to
  the process zone, so the same commit prerendered `Europe/Tallinn` locally and
  `UTC` on Vercel. Fixed with `SITE_TIME_ZONE`; the Tenant document supersedes
  it when a later ticket formats a date.
- **375,143 bytes of Zod on every locale page.** This ticket added the repo's
  first client component, which created the first client module graph, which
  reached `@salon/core`'s barrel and pulled Zod in. Fixed by giving
  `@salon/core` a zod-free `./locale` entry point. Locale pages 998,347 →
  623,204 bytes.
- **A comment stating a rule the code contradicts.** The 404 is Estonian even
  at `/en/…`, which is where an English Visitor is most likely to land.
  Behaviour kept — locale-awareness would cost a per-request route — and
  recorded.

Carried forward, not blocking:

- `packages/ui/src/chrome/index.ts` cross-references `@salon/ui/i18n` as
  existing "for the same reason"; it does not. One-line reword when touched.
- Nothing structurally prevents a later `"use client"` component importing the
  `@salon/core` barrel and re-shipping Zod. An eslint `no-restricted-imports`
  scoped to files carrying `"use client"` would close it. Until then the
  standing chunk-size invariant catches it at verification.
- `SITE_URL` is `https://demo-salon.example`, a reserved non-resolving domain,
  and is now in every canonical and `hreflang`. Awaiting a decision.
