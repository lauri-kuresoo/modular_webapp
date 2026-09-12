/**
 * `@salon/theme` — the Theme token contract, its presets, and the emitter that
 * turns one into CSS custom properties.
 *
 * May depend on `@salon/core` only. Ships two entry points:
 *
 * - this module, for the `themeTokens` / `themeStyleSheet` seam and the types;
 * - `@salon/theme/base.css`, the base stylesheet every Site imports, which maps
 *   `--token-*` onto Tailwind's namespaces and carries the global
 *   reduced-motion rule.
 */
export {
  SEMANTIC_COLORS,
  SHADOW_LEVELS,
  THEME_MODES,
  TYPEFACES,
  TYPEFACE_IDS,
  type ColorMap,
  type DensityScale,
  type Oklch,
  type RadiusScale,
  type SemanticColor,
  type ShadowLevel,
  type ThemeMode,
  type ThemePreset,
  type TypefaceId,
  type TypePairing,
} from "./tokens";

export { THEME_NAMES, THEME_PRESETS, themePreset, type ThemeName } from "./presets";

export { themeStyleSheet, themeTokens } from "./emit";
