# 05: Estonian by default, English at `/en`, with a fallback chain

**What to build:** The Site serves Estonian at `/` and English at `/en/…`. A
Visitor can switch between them and stay on the same page. A Content field with
no English value renders the Estonian one rather than a blank, and the platform
can report which fields are missing a translation so ticket 12's editor can
flag them.

**Blocked by:** 04 (`TenantRepository` and Content).

**Status:** ready-for-agent

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
