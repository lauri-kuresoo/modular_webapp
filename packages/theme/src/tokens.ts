/**
 * The Theme token contract.
 *
 * A Theme is a token set, not a palette: nine semantic colours, a type pairing,
 * a radius scale, a density scale and a shadow level. This file declares the
 * whole vocabulary; `presets.ts` supplies values and `emit.ts` turns them into
 * CSS custom properties.
 *
 * Adding a tenth semantic colour is a platform decision. A Section that wants
 * one is a Section reaching for a colour it should have asked for semantically.
 *
 * The obvious candidate for a tenth is `accent-hover`, and this ticket
 * deliberately does not add it — the two primitives here express hover with
 * shadow, border and surface instead. If ticket 15 revisits that, the thing to
 * know is that "same colour, lightness shifted" does not derive safely at full
 * chroma near the sRGB boundary, and which direction clips flips with the mode.
 * Slate's light accent `oklch(0.546 0.2 258)` is the worked example: darkening
 * it clips (`l-0.04` at full chroma leaves the gamut; `l-0.04` with chroma at
 * 0.9 does not), while lightening it stays in gamut at full chroma. Its dark
 * accent `oklch(0.7 0.15 258)` behaves the other way round. So a derived hover
 * token is a gamut-mapping decision per preset and per mode, not one formula —
 * which is why it is a platform call and not something a Section improvises.
 */

/**
 * The nine semantic colours from spec 0001. Order is the contract's order and is
 * what the emitter walks, so a new token cannot be added without appearing here.
 */
export const SEMANTIC_COLORS = [
  "surface",
  "surface-raised",
  "text",
  "text-muted",
  "accent",
  "accent-contrast",
  "border",
  "success",
  "danger",
] as const;

export type SemanticColor = (typeof SEMANTIC_COLORS)[number];

/**
 * Written as a union rather than derived from a `["light", "dark"]` array,
 * because nothing iterates the modes: `themeStyleSheet` emits light on `:root`
 * and dark inside a media query, which are structurally different rather than
 * two passes of one loop. An array would exist only to be turned back into this.
 */
export type ThemeMode = "light" | "dark";

/**
 * An OKLCH triple: lightness `0..1`, chroma (`0` to roughly `0.37` before
 * leaving the sRGB gamut at any hue), hue in degrees.
 *
 * Colours are stored in OKLCH rather than hex because lightness is
 * perceptually uniform there: a hover state is the same colour with `l`
 * shifted, with no hue drift, and contrast stays predictable when a Tenant
 * swaps presets.
 */
export type Oklch = readonly [l: number, c: number, h: number];

export type ColorMap = Readonly<Record<SemanticColor, Oklch>>;

/**
 * The typefaces a preset may pair. Each entry names the CSS custom property the
 * Site is expected to define — `next/font` generates one per family — plus the
 * stack to fall back to before it loads.
 *
 * This is a CSS-level contract, not a TypeScript one: the Site's font module
 * passes these same variable names to `next/font`, which requires string
 * literals at the call site and so cannot import them from here.
 */
export const TYPEFACES = {
  fraunces: {
    variable: "--font-fraunces",
    fallback: "Georgia, 'Times New Roman', serif",
  },
  karla: {
    variable: "--font-karla",
    fallback: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  "space-grotesk": {
    variable: "--font-space-grotesk",
    fallback: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  inter: {
    variable: "--font-inter",
    fallback: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
} as const;

export type TypefaceId = keyof typeof TYPEFACES;

/** Two families, exposed to Sections as `--font-display` and `--font-body`. */
export type TypePairing = {
  readonly display: TypefaceId;
  readonly body: TypefaceId;
};

/**
 * Radius is a scale rather than a boolean, which is half of what makes the
 * soft/rounded versus sharp axis real rather than a colour change.
 */
export type RadiusScale = {
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
};

/**
 * Density is the other half. `step` is the base unit the whole spacing scale is
 * derived from — Tailwind multiplies it, so `p-6` is physically smaller in a
 * dense preset — and `leading` is body line-height, because vertical rhythm is
 * as much of the airy/dense impression as padding is.
 */
export type DensityScale = {
  readonly step: string;
  readonly leading: string;
};

/**
 * A shadow level is one knob, not three values a preset picks independently.
 * The emitter expands it to `--token-shadow-sm|md|lg`, so a preset cannot
 * declare a soft small shadow and a crisp large one.
 */
export const SHADOW_LEVELS = {
  /** No elevation. Separation comes from `border` alone. */
  flat: {
    sm: "0 0 0 0 rgb(0 0 0 / 0)",
    md: "0 0 0 0 rgb(0 0 0 / 0)",
    lg: "0 0 0 0 rgb(0 0 0 / 0)",
  },
  /** Wide, diffuse, low-alpha. Reads as lifted paper. */
  soft: {
    sm: "0 1px 2px rgb(0 0 0 / 0.04), 0 2px 8px rgb(0 0 0 / 0.05)",
    md: "0 2px 4px rgb(0 0 0 / 0.04), 0 8px 24px rgb(0 0 0 / 0.07)",
    lg: "0 4px 8px rgb(0 0 0 / 0.05), 0 16px 48px rgb(0 0 0 / 0.09)",
  },
  /** Tight, offset, higher-alpha. Reads as a hard edge over a plane. */
  crisp: {
    sm: "0 1px 0 rgb(0 0 0 / 0.08)",
    md: "0 2px 0 rgb(0 0 0 / 0.1), 0 4px 8px rgb(0 0 0 / 0.06)",
    lg: "0 4px 0 rgb(0 0 0 / 0.1), 0 8px 16px rgb(0 0 0 / 0.08)",
  },
} as const;

export type ShadowLevel = keyof typeof SHADOW_LEVELS;

/**
 * One complete Theme. Every field is required: there is no partial preset and no
 * merging of one preset's colours with another's type, because that is a design
 * system with no designer.
 */
export type ThemePreset = {
  /**
   * What a Tenant sees in the picker (ticket 15). The *identifier* is not a
   * field: a preset is identified by its key in `THEME_PRESETS`, which is what
   * `ThemeName` is derived from, so there is no second spelling of the name that
   * could drift from the first.
   */
  readonly label: string;
  readonly colors: Readonly<Record<ThemeMode, ColorMap>>;
  readonly type: TypePairing;
  readonly radius: RadiusScale;
  readonly density: DensityScale;
  readonly shadow: ShadowLevel;
};
