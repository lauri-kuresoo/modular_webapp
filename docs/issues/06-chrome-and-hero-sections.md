# 06: Chrome and the top of the page

**What to build:** A Visitor arriving on mobile data sees a photograph of the
real premises almost immediately, with a navigation bar, a headline, an
introduction to the business and a call to action — all of it the Tenant's own
content, in the active Theme, in either locale. Sections delivered: Navbar
(three variants), Footer, Hero (image / video / split), About, CTABand.

**Blocked by:** 05 (i18n).

**Status:** ready-for-agent

## Design and technology choices

**The Navbar's transparency is derived, not configured.** The
transparent-over-hero variant only works when the first Section is a Hero with a
background. Derive that from the Composition rather than exposing it as an
independent prop, so the two cannot desync into white text on a white
background. If the Composition has no leading Hero, fall back to solid.

**Scroll state via `IntersectionObserver` on a sentinel element**, not a scroll
event listener. One observer callback firing twice beats a listener firing on
every frame, and it is the difference between a smooth and a janky first
impression on a mid-range Android.

**The Hero is the LCP and everything about it is subordinate to that.** Explicit
intrinsic dimensions and a `sizes` attribute, high fetch priority, no lazy
loading, and the aspect ratio reserved in CSS so nothing shifts. The image
dimensions and a blur placeholder come from the content document — computed once
at upload in ticket 13, never probed at render.

**Video Hero: poster first, autoplay second.** Muted, inline, looping, with a
poster that is itself a properly optimised image, so the LCP is the poster and
not the video. Under `prefers-reduced-motion: reduce`, do not autoplay at all —
show the poster and a play control. A zeroed transition duration (ticket 02)
does not stop a playing video, so this is the case the global rule cannot
handle.

**Split Hero is a layout variant, not a different Section.** Same content shape,
different arrangement. If a variant needs a different content shape it is a new
`type`, not a variant — that boundary keeps the registry honest.

**Mobile navigation uses the native `<dialog>` element** (or a headless dialog
primitive over it). Focus trapping, Escape to close and inert background come
from the platform rather than from hand-written key handlers that will be
subtly wrong.

**A skip link is the first focusable element on the page**, targeting the main
landmark. With a screen-reader story in scope, this is not optional polish.

**Landmarks and headings.** One `<header>`, one `<main>`, one `<footer>`, one
`<h1>` per page and it belongs to the Hero. Sections below take `<h2>`. Fix the
heading level policy here, because the later Section tickets will each have to
follow it and there is no test that will catch a drift into three `<h1>`s.

**Footer holds the compliance and contact furniture**: address, phone, email,
opening hours summary, the `LocaleSwitcher`, and a link slot for a privacy
notice. It is content-driven like everything else.

**Still zero client JavaScript except the navbar scroll state and the mobile
menu.** Keep both tiny and colocated; the booking widget in ticket 19 is meant
to be the page's only substantial island.

## Acceptance criteria

- [ ] Navbar renders in all three variants; the transparent variant is chosen from the Composition's leading Section rather than an independent prop, and falls back to solid when there is no leading Hero
- [ ] Navbar scroll state uses an intersection observer, not a scroll listener
- [ ] Hero renders in image, video and split variants from Tenant content in both locales
- [ ] The Hero image is the LCP element: eagerly loaded, high priority, explicit dimensions with a reserved aspect ratio and a blur placeholder, and the page shows no layout shift
- [ ] Under reduced motion the video Hero does not autoplay and offers a play control
- [ ] Mobile navigation traps focus, closes on Escape and returns focus to the trigger
- [ ] A skip link is the first focusable element and reaches the main landmark
- [ ] Exactly one `<h1>` per page, contributed by the Hero; the documented heading policy is recorded with the registry
- [ ] Footer renders address, phone, email, hours summary and the locale switcher from content
- [ ] About and CTABand render from content, with the CTA target configurable in the Composition
