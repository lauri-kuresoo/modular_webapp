# 02: Theme token contract, light and dark, two presets

**What to build:** The same Site page from ticket 01 renders in either of two
visibly different Themes by changing one value, and follows the operating
system's light/dark preference in both. No component knows which Theme is
active. A Visitor who prefers reduced motion gets no animation anywhere.

**Blocked by:** 01 (Monorepo skeleton).

**Status:** ready-for-agent

**Build status:** changes-requested

## Design and technology choices

**A Theme is a token set, not a palette.** Nine semantic colours from the spec —
`surface`, `surface-raised`, `text`, `text-muted`, `accent`, `accent-contrast`,
`border`, `success`, `danger` — plus a type pairing, a radius scale, a density
scale and a shadow level. Adding a tenth token is a platform decision; a Section
asking for one is a smell.

**Colour space is OKLCH.** Perceptually uniform lightness means a hover state is
"the same colour, lightness shifted" without hue drift, and contrast behaves
predictably when you swap presets. Store tokens as OKLCH triples, not hex.

**`accent-contrast` is a pair, not a computation.** The preset declares the
foreground that goes on `accent`. No component ever computes a contrasting
colour at runtime — that is how you get grey-on-grey buttons in the one preset
nobody checked.

**Delivery is server-rendered CSS custom properties.** `themeTokens(name, mode)`
returns a declaration block; the Site's root layout inlines it in a `<style>`
element. No client JavaScript, no theme provider, no flash of the wrong theme,
and it survives static generation because the Theme is known at build time.

**Tailwind sees tokens through `@theme inline`.** Map `--color-surface:
var(--token-surface)` and so on, so `bg-surface`, `text-text-muted` and
`border-border` exist as ordinary utilities. Sections then write Tailwind, not
inline styles, and stay themeable.

**Dark mode follows the OS only.** Each preset defines both maps; emit the light
map on `:root` and the dark map inside `@media (prefers-color-scheme: dark)`.
The spec's story is "respect that", not "let me toggle it" — a manual toggle
needs persistence and a client component, and buys nothing in v1. Structure the
emitter so a `[data-mode]` selector could be added later without touching
Sections.

**Reduced motion is global and lives here.** One
`@media (prefers-reduced-motion: reduce)` rule in the base stylesheet zeroing
transition and animation durations. Put it at the platform layer so no Section
can forget it; individual tickets then only handle the cases a duration of zero
does not solve (autoplaying video, ticket 06).

**Density and radius are scales, not booleans.** `--radius-sm|md|lg` and a
spacing step the airy and dense presets set differently. This is what makes the
soft/rounded/airy versus sharp/dense axis real rather than a colour change.

**Fonts through `next/font`.** Self-hosted, subset, no third-party request — which
also keeps the cookieless promise from the spec intact. A type pairing is two
`next/font` families exposed as `--font-display` and `--font-body`.

**Contrast is checked by hand and written down.** With no tests, record the
measured ratio for each foreground/background pair as a comment beside the
preset. Target WCAG AA: 4.5:1 body text, 3:1 large text and non-text UI.

**Two presets in this ticket, not six.** One soft/rounded/airy and one
sharp/dense, so the axes are exercised by real values before ticket 15 fills the
set out. Two presets prove the contract; six just multiply the rework if the
contract is wrong.

## Acceptance criteria

- [ ] All nine semantic colours plus type pairing, radius scale, density scale and shadow level are declared as tokens, in OKLCH for colours
- [ ] Two presets exist and differ on both the colour and the personality axis; switching a single value in the Site swaps the whole look
- [ ] Both presets define a light and a dark map, and the page follows the OS preference with no flash on load and no client JavaScript
- [ ] Tailwind utilities resolve to tokens (`bg-surface`, `text-text`, `border-border`, radius and font utilities)
- [ ] `prefers-reduced-motion: reduce` zeroes transitions and animations globally from the base stylesheet
- [ ] No component in the repo accepts a colour value; the primitives built here take `variant="primary" | "subtle" | "ghost"`
- [ ] Measured contrast ratios are recorded next to each preset and every pair meets WCAG AA
