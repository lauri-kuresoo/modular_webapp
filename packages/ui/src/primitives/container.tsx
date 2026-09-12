import type { ReactNode } from "react";

const WIDTHS = {
  prose: "max-w-2xl",
  content: "max-w-5xl",
  wide: "max-w-7xl",
} as const;

export type ContainerWidth = keyof typeof WIDTHS;

export type ContainerProps = {
  children: ReactNode;
  /** Semantic intent, not a pixel value — Sections never pick their own measure. */
  width?: ContainerWidth;
};

/**
 * The horizontal measure every Section sits inside. A Server Component: no
 * hooks, no event handlers, no `"use client"`.
 */
export function Container({ children, width = "content" }: ContainerProps) {
  return <div className={`mx-auto w-full px-6 sm:px-8 ${WIDTHS[width]}`}>{children}</div>;
}
