# 02: Theme token contract, light and dark, two presets

**What to build:** The same Site page from ticket 01 renders in either of two
visibly different Themes by changing one value, and follows the operating
system's light/dark preference in both. No component knows which Theme is
active. A Visitor who prefers reduced motion gets no animation anywhere.

**Blocked by:** 01 (Monorepo skeleton).

**Status:** ready-for-agent

**Build status:** done

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

## Build log

**Ticket 02 — done.**

| | |
|---|---|
| Branch | `ticket/02-theme-token-contract` |
| Commits | `de19cf4` (build), `66db2c4` (self-review fixes), `46e24cd` (fix round 1) |
| Final commit | `46e24cd` |
| Merged to integration branch | `b5d6af8` |
| Verify 1 (`66db2c4`) | CHANGES REQUESTED |
| Verify 2 (`46e24cd`) | **Not completed — stopped by the user as good enough** |

### The one real defect, and why it mattered

The `prefers-reduced-motion` rule was placed **outside** every cascade layer, with
a comment explaining that unlayered `!important` beats layered `!important`. That
is the inverse of CSS Cascade 5 §6.4.4, which reverses layer order for important
declarations — so the rule sat in the weakest position available, not the
strongest. The wrong explanation was half the defect: it would have taught the
next author a false rule.

Measured in Chrome under `--force-prefers-reduced-motion`, before → after:

| element | before | after |
|---|---|---|
| `transition` | 1e-05s | 1e-05s |
| `transition duration-500!` | **0.5s** | 1e-05s |
| `animate-spin` | 1e-05s | 1e-05s |
| `animate-spin!` | **1s** | 1e-05s |

Fixed by wrapping the block in `@layer theme`. That layer specifically, not a new
one: Tailwind v4's `index.css` opens with `@layer theme, base, components,
utilities;`, and layer order is fixed by first appearance, so a custom layer name
imported after `tailwindcss` lands after `utilities` and reproduces the original
bug. Verified against the real shipped `.next/static/chunks/*.css`, with a no-flag
control confirming the rule does not over-apply.

### Also fixed in the same round

- A doc comment in `button.tsx` used `className="bg-[#f00]"` as an illustration.
  Tailwind's scanner is text-based and does not know it is a comment, so a live
  `.bg-\[\#f00\]{background-color:red}` rule was shipping in every Site's CSS. The
  repo was swept for the same hazard (`[#`, `[rgb`, `[hsl`, `[oklch`, `[var(`);
  that was the only instance.
- `ThemePreset.name` removed — a second spelling of the `THEME_PRESETS` key that
  could only drift from it. `label` still covers ticket 15's picker.
- The `accent-hover` rationale was wrong and is corrected. The real constraint is
  that the sRGB clipping direction **flips with the mode**: Slate's light accent
  clips when darkened at full chroma but not when lightened, its dark accent the
  reverse. So no single lightness-shift formula derives safely near the gamut
  boundary — a per-preset, per-mode decision. The decision to ship no tenth token
  stands; only the stated reason changed.
- Public surface of `@salon/theme` narrowed: `THEME_MODES`, `TYPEFACE_IDS`,
  `THEME_NAMES` and `themePreset()` removed. Ticket 15 is the likely ticket to
  want them back; one line each, with a real caller. `themePreset()` had two live
  call sites in `apps/demo-salon`, updated to index `THEME_PRESETS` directly.

### Independently confirmed by the first verifier

All 52 contrast pairs recomputed from the branch's OKLCH triples with an
independent OKLab → linear-sRGB → WCAG 2.1 implementation, matrices validated
against the sRGB primaries: **52/52 recorded ratios accurate to <0.015, none
below target, none out of gamut**, still passing after 8-bit quantisation. Both
type guards confirmed to genuinely guard. `--color-*: initial` confirmed to
remove `bg-red-500`/`bg-white`/`text-neutral-600` while `border-transparent` and
`--font-sans`/`--font-mono` survive. Criteria 1, 2, 4, 6, 7 confirmed. Criterion 3
confirmed by rendering with all Next scripts stripped — light and dark both
resolve with no client JavaScript.

### Known-outstanding

- **The fix round was never independently verified.** Verify 2 was stopped mid-run
  at the user's direction. Everything in "Also fixed in the same round" above rests
  on the implementer's own evidence, which was detailed and reproducible but is
  self-reported. If anything in this ticket is later found wrong, look there first.
- **Nothing in CI enforces any of this.** The reduced-motion guarantee rests on a
  comment and a one-off browser measurement; a later Section ticket could regress
  the layer undetected. Consistent with this ticket's explicit "measure by hand and
  write it down" posture, but a real gap a later ticket may want to close.
- **Two gaps for Sections 06–09**, inherited from `--color-*: initial`: arbitrary
  values (`bg-[#ff0000]`) remain an open back door past the palette clearing, and
  there is no neutral black/white token for an overlay scrim.
- **`@layer theme` couples the platform to Tailwind's internal layer name.** A
  Tailwind upgrade that renamed or reordered its layers would silently weaken the
  reduced-motion rule. Nothing would detect it.
- `preload: false` on all four font families — all must be declared for
  `SITE_THEME` to stay the only switch, and Next was preloading ~400KB for a page
  using two. Flagged in-file for ticket 15 to revisit with per-preset font modules.
