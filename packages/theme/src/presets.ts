import type { ThemePreset } from "./tokens";

/**
 * Two presets, not six. They exist to prove the token contract against real
 * values on both axes — warm/soft/rounded/airy versus cool/sharp/dense — before
 * ticket 15 fills the set out. Six presets built against a contract nobody has
 * exercised just multiply the rework when the contract turns out to be wrong.
 *
 * ## How the recorded contrast ratios were measured
 *
 * There is no test runner in this repo yet, so the ratios below were computed
 * once and written down, per the ticket. Each OKLCH triple was converted to
 * linear sRGB via the standard OKLab matrices, checked to be inside the sRGB
 * gamut, and run through the WCAG 2.1 relative-luminance and contrast formulae
 * (`(Lhi + 0.05) / (Llo + 0.05)`). Re-deriving a row is a dozen lines of
 * arithmetic against those published formulae.
 *
 * Targets, from WCAG 2.1 AA:
 *
 * - 4.5:1 for anything that can carry body text — `text`, `text-muted`,
 *   `accent`, `success` and `danger` on both surfaces, and `accent-contrast` on
 *   `accent`.
 * - 3:1 for `border`. `border` is deliberately strong enough to bound an
 *   interactive control (an input, a focus ring) at the 1.4.11 Non-text
 *   Contrast threshold. That is why there is one border token rather than a
 *   decorative hairline plus a functional outline: a Section handed both would
 *   pick the pretty one for a text field.
 *
 * Every pair in both presets and both modes meets its target; the measured
 * value is recorded beside each preset.
 */

/**
 * Soft, rounded, airy. Warm off-white paper with a terracotta accent, a serif
 * display face over a humanist body, generous spacing and diffuse shadows.
 *
 * Measured contrast (light):
 *   text            on surface        14.38:1   on surface-raised  15.37:1
 *   text-muted      on surface         5.56:1   on surface-raised   5.94:1
 *   accent          on surface         4.63:1   on surface-raised   4.95:1
 *   accent-contrast on accent          4.88:1
 *   success         on surface         4.61:1   on surface-raised   4.92:1
 *   danger          on surface         4.62:1   on surface-raised   4.93:1
 *   border          on surface         3.15:1   on surface-raised   3.37:1
 *
 * Measured contrast (dark):
 *   text            on surface        15.67:1   on surface-raised  13.66:1
 *   text-muted      on surface         8.43:1   on surface-raised   7.35:1
 *   accent          on surface         7.55:1   on surface-raised   6.59:1
 *   accent-contrast on accent          7.26:1
 *   success         on surface         9.52:1   on surface-raised   8.30:1
 *   danger          on surface         6.86:1   on surface-raised   5.98:1
 *   border          on surface         3.63:1   on surface-raised   3.17:1
 */
const linen: ThemePreset = {
  label: "Linen",
  colors: {
    light: {
      surface: [0.972, 0.008, 85],
      "surface-raised": [0.995, 0.004, 85],
      text: [0.26, 0.02, 60],
      "text-muted": [0.5, 0.02, 60],
      accent: [0.556, 0.14, 42],
      "accent-contrast": [0.99, 0.005, 85],
      border: [0.636, 0.012, 80],
      success: [0.53, 0.12, 150],
      danger: [0.564, 0.18, 27],
    },
    dark: {
      surface: [0.2, 0.012, 60],
      "surface-raised": [0.255, 0.014, 60],
      text: [0.95, 0.008, 85],
      "text-muted": [0.76, 0.012, 75],
      accent: [0.74, 0.12, 45],
      "accent-contrast": [0.22, 0.03, 45],
      border: [0.544, 0.015, 60],
      success: [0.78, 0.13, 150],
      danger: [0.72, 0.15, 27],
    },
  },
  type: { display: "fraunces", body: "karla" },
  radius: { sm: "0.5rem", md: "0.875rem", lg: "1.5rem" },
  density: { step: "0.28rem", leading: "1.75" },
  shadow: "soft",
};

/**
 * Sharp and dense. Cool near-neutral greys with a saturated blue accent, a
 * geometric display face over a neutral grotesque, tight spacing and hard
 * offset shadows.
 *
 * Measured contrast (light):
 *   text            on surface        15.78:1   on surface-raised  17.30:1
 *   text-muted      on surface         5.95:1   on surface-raised   6.53:1
 *   accent          on surface         4.63:1   on surface-raised   5.08:1
 *   accent-contrast on accent          5.08:1
 *   success         on surface         4.64:1   on surface-raised   5.09:1
 *   danger          on surface         4.63:1   on surface-raised   5.08:1
 *   border          on surface         3.16:1   on surface-raised   3.47:1
 *
 * Measured contrast (dark):
 *   text            on surface        17.28:1   on surface-raised  15.59:1
 *   text-muted      on surface         8.42:1   on surface-raised   7.60:1
 *   accent          on surface         7.21:1   on surface-raised   6.51:1
 *   accent-contrast on accent          7.21:1
 *   success         on surface         9.57:1   on surface-raised   8.63:1
 *   danger          on surface         6.73:1   on surface-raised   6.08:1
 *   border          on surface         3.50:1   on surface-raised   3.16:1
 */
const slate: ThemePreset = {
  label: "Slate",
  colors: {
    light: {
      surface: [0.968, 0.003, 250],
      "surface-raised": [1.0, 0.0, 250],
      text: [0.22, 0.02, 255],
      "text-muted": [0.48, 0.02, 255],
      accent: [0.546, 0.2, 258],
      "accent-contrast": [1.0, 0.0, 258],
      border: [0.632, 0.008, 250],
      success: [0.524, 0.129, 155],
      danger: [0.566, 0.22, 25],
    },
    dark: {
      surface: [0.16, 0.014, 255],
      "surface-raised": [0.215, 0.016, 255],
      text: [0.96, 0.004, 255],
      "text-muted": [0.74, 0.012, 255],
      accent: [0.7, 0.15, 258],
      "accent-contrast": [0.16, 0.02, 255],
      border: [0.518, 0.018, 255],
      success: [0.76, 0.14, 155],
      danger: [0.7, 0.17, 25],
    },
  },
  type: { display: "space-grotesk", body: "inter" },
  radius: { sm: "0rem", md: "0.125rem", lg: "0.25rem" },
  density: { step: "0.22rem", leading: "1.45" },
  shadow: "crisp",
};

/**
 * The presets, keyed by the name a Site puts in its config. The key *is* the
 * identifier — there is no `name` field duplicating it — and `ThemeName` is
 * derived from it, so a Site cannot name a Theme that does not exist.
 *
 * Read it by indexing: `THEME_PRESETS[name]`. There is no accessor function,
 * because a one-line wrapper over a lookup is a second way to do the same thing
 * and the type of the index is already exact.
 */
export const THEME_PRESETS = { linen, slate } as const;

/** The Theme a Site names in its config. Ticket 15 widens this to six. */
export type ThemeName = keyof typeof THEME_PRESETS;
