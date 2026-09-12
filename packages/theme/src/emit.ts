import { THEME_PRESETS, type ThemeName } from "./presets";
import {
  SEMANTIC_COLORS,
  SHADOW_LEVELS,
  TYPEFACES,
  type Oklch,
  type ThemeMode,
  type ThemePreset,
  type TypefaceId,
} from "./tokens";

/**
 * Tokens are emitted under `--token-*` and mapped to Tailwind's own namespaces
 * by `base.css`. Keeping the two namespaces distinct means a Section writing
 * `bg-surface` goes through the map, and a Section reaching for
 * `var(--token-surface)` directly is visible in review.
 */
const PREFIX = "--token";

/**
 * Values reaching this function are built from typed preset data, so this is not
 * the security boundary — but the emitted block is inlined into a `<style>`
 * element, and ticket 15 will merge Tenant-supplied token overrides through the
 * very same emitter. Refusing anything that could close a declaration or open an
 * at-rule now means that ticket inherits a seam that is already safe.
 */
const FORBIDDEN = /[;{}<>@\\]|url\(|expression\(|\/\*/i;

function cssValue(value: string): string {
  if (FORBIDDEN.test(value)) {
    throw new Error(`Unsafe CSS token value: ${JSON.stringify(value)}`);
  }
  return value;
}

const oklch = ([l, c, h]: Oklch): string => `oklch(${l} ${c} ${h})`;

const fontStack = (id: TypefaceId): string =>
  `var(${TYPEFACES[id].variable}), ${TYPEFACES[id].fallback}`;

type Declaration = readonly [property: string, value: string];

/**
 * Every token for one mode, including the mode-independent ones.
 *
 * The block is deliberately self-contained rather than a colour-only delta: drop
 * it under any selector and that selector is a complete Theme. That is what lets
 * `themeStyleSheet` add a `[data-mode="dark"]` block later — for a manual
 * toggle, which v1 does not have — without Sections or presets changing.
 */
function declarations(preset: ThemePreset, mode: ThemeMode): Declaration[] {
  const colors = preset.colors[mode];
  const shadow = SHADOW_LEVELS[preset.shadow];

  return [
    ...SEMANTIC_COLORS.map((token): Declaration => [`${PREFIX}-${token}`, oklch(colors[token])]),
    [`${PREFIX}-font-display`, fontStack(preset.type.display)],
    [`${PREFIX}-font-body`, fontStack(preset.type.body)],
    [`${PREFIX}-radius-sm`, preset.radius.sm],
    [`${PREFIX}-radius-md`, preset.radius.md],
    [`${PREFIX}-radius-lg`, preset.radius.lg],
    [`${PREFIX}-space-step`, preset.density.step],
    [`${PREFIX}-leading-body`, preset.density.leading],
    [`${PREFIX}-shadow-sm`, shadow.sm],
    [`${PREFIX}-shadow-md`, shadow.md],
    [`${PREFIX}-shadow-lg`, shadow.lg],
  ];
}

/**
 * The narrow seam spec 0001 names: a Theme name and a mode in, a block of CSS
 * custom property declarations out. No selector, no braces — the caller decides
 * where the block lands.
 */
export function themeTokens(name: ThemeName, mode: ThemeMode): string {
  return declarations(THEME_PRESETS[name], mode)
    .map(([property, value]) => `  ${property}: ${cssValue(value)};`)
    .join("\n");
}

const rule = (selector: string, body: string): string => `${selector} {\n${body}\n}`;

const indent = (block: string): string =>
  block
    .split("\n")
    .map((line) => (line ? `  ${line}` : line))
    .join("\n");

/**
 * The stylesheet a Site inlines in its root layout.
 *
 * Light on `:root`, dark inside `prefers-color-scheme: dark`. Both maps ship in
 * the document, so the browser picks one before first paint: there is no
 * provider, no client JavaScript and therefore no flash of the wrong Theme, and
 * the whole thing survives static generation because the Theme is known at build
 * time.
 *
 * The spec's story is "respect the OS preference", not "let me toggle it". A
 * manual toggle needs persistence and a client component and buys nothing in v1.
 */
export function themeStyleSheet(name: ThemeName): string {
  return [
    rule(":root", themeTokens(name, "light")),
    rule("@media (prefers-color-scheme: dark)", indent(rule(":root", themeTokens(name, "dark")))),
  ].join("\n");
}
