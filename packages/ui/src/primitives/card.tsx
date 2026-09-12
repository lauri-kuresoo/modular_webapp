import type { ReactNode } from "react";

/**
 * Elevation is semantic and comes from the Theme's shadow level, so a preset
 * that chose flat shadows stays flat here rather than having a Section
 * reintroduce depth it deliberately dropped.
 */
const ELEVATIONS = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
} as const;

export type CardElevation = keyof typeof ELEVATIONS;

export type CardProps = {
  children: ReactNode;
  elevation?: CardElevation;
};

/**
 * A raised panel: the Theme's raised surface, border, large radius and shadow
 * level in one place. Sections compose it rather than each reassembling the
 * same four tokens slightly differently.
 */
export function Card({ children, elevation = "md" }: CardProps) {
  return (
    <div
      className={`bg-surface-raised border-border rounded-lg border p-6 ${ELEVATIONS[elevation]}`}
    >
      {children}
    </div>
  );
}
