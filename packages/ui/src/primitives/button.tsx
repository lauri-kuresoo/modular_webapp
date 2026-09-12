import type { ComponentPropsWithoutRef } from "react";

/**
 * Semantic intent, never a colour. A Section says what a button *is* for; the
 * active Theme decides what that looks like.
 *
 * Written as whole class strings rather than composed fragments because
 * Tailwind scans source text: a class assembled at runtime is a class that does
 * not get generated.
 */
const VARIANTS = {
  /** The one action on the page we want taken. At most one per Section. */
  primary: "bg-accent text-accent-contrast shadow-sm hover:shadow-md",
  /** A real alternative, competing with the primary but not shouting. */
  subtle: "bg-surface-raised text-text border border-border shadow-sm hover:border-accent",
  /** Tertiary. Carries no weight of its own until pointed at. */
  ghost: "text-accent border border-transparent hover:bg-surface-raised",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;

/**
 * `className` and `style` are omitted deliberately, not forgotten.
 *
 * The spec's promise is that no component accepts a colour, and a component
 * that accepts either of those accepts a colour — `style={{ color }}` directly,
 * or a `className` carrying an arbitrary-value background utility by the back
 * door. Positioning a button is the parent's job, done on a wrapper.
 *
 * That example is described rather than written out, because Tailwind's source
 * scanner is plain text matching and has no idea this is a comment. An
 * arbitrary-value colour class spelled literally anywhere in this file gets
 * scanned and emitted as a real rule into every Site's production stylesheet —
 * a doc comment illustrating the rule would have quietly broken it.
 */
export type ButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "className" | "style" | "color"
> & {
  variant?: ButtonVariant;
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 " +
  "font-body text-base leading-none font-medium transition " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "disabled:pointer-events-none disabled:opacity-50";

/**
 * A Server Component. It renders a `<button>` and nothing else; a Section that
 * needs an `onClick` is itself a client component and passes one through.
 */
export function Button({ variant = "primary", type = "button", ...props }: ButtonProps) {
  // `props` is spread first on purpose. `className` is excluded from `ButtonProps`
  // but nothing stops it arriving at runtime, and a spread placed last would let
  // it silently replace the Theme classes — the exact hole the type is closing.
  return <button {...props} type={type} className={`${BASE} ${VARIANTS[variant]}`} />;
}
