import { Fraunces, Inter, Karla, Space_Grotesk } from "next/font/google";
import type { TypefaceId, TypePairing } from "@salon/theme";

/**
 * The Site's side of the type contract.
 *
 * `@salon/theme` names the CSS custom property each typeface must be published
 * under; this module is what publishes them. `next/font` self-hosts and subsets
 * the files at build time, so there is no request to a third party and no cookie
 * — which is what keeps the spec's cookieless promise true for fonts.
 *
 * The variable names below are repeated as string literals because `next/font`
 * is compiled by an SWC transform that requires literal arguments and cannot
 * read them from `TYPEFACES`. That repetition is a CSS-level contract, not a
 * TypeScript one: if a name here stops matching the one in `TYPEFACES`, the
 * emitted `var(--font-...)` resolves to nothing and the family silently falls
 * back. The `satisfies` below catches the half that *can* be checked — that this
 * module publishes exactly the typefaces the contract names, so a preset can
 * never pair a family nobody loaded.
 *
 * The subset list is repeated per call for the same reason. `latin-ext` is not
 * optional: Estonian needs õ, š and ž, and they are not in the `latin` subset.
 *
 * ## Why `preload: false`
 *
 * All four families have to be declared here, because `SITE_THEME` is meant to
 * be the only value a Site changes and `next/font` cannot be called
 * conditionally. Next preloads every family a rendered module declares, not just
 * the ones whose variables are used — which was eight `<link rel="preload">`
 * font files, around 400 kB, for a page that references two of them.
 *
 * Turning preload off drops the wasted requests entirely: the `@font-face`
 * rules still ship, and the browser fetches only the two families the active
 * pairing's CSS variables actually reference. The cost is that those two are
 * discovered one round trip later, which `display: "swap"` plus Next's
 * metric-matched fallback face covers without a layout shift.
 *
 * When ticket 15 settles the final preset list, per-preset font modules would
 * let the active pairing be preloaded properly and the rest not declared at all.
 */
const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
  variable: "--font-fraunces",
});
const karla = Karla({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
  variable: "--font-karla",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
  variable: "--font-space-grotesk",
});
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
  variable: "--font-inter",
});

/** The generated class that defines each typeface's custom property. */
const TYPEFACE_CLASSES = {
  fraunces: fraunces.variable,
  karla: karla.variable,
  "space-grotesk": spaceGrotesk.variable,
  inter: inter.variable,
} as const satisfies Record<TypefaceId, string>;

/**
 * The classes to put on `<html>` for one pairing. Only the two families the
 * active preset actually names are applied, so the others contribute no
 * `@font-face` to the rendered document.
 */
export function typefaceClassNames(pairing: TypePairing): string {
  return [TYPEFACE_CLASSES[pairing.display], TYPEFACE_CLASSES[pairing.body]].join(" ");
}
