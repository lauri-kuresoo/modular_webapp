"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Id of the sentinel ComposedPage places at the top of a leading Hero. */
export const NAVBAR_SCROLL_SENTINEL_ID = "navbar-scroll-sentinel";

/**
 * Scroll state for a transparent-over-hero Navbar, via IntersectionObserver on a
 * sentinel rather than a scroll listener.
 *
 * The sentinel lives at the top of the leading Hero (`NAVBAR_SCROLL_SENTINEL_ID`).
 * While it intersects the viewport the bar stays transparent; once it leaves,
 * solid surface classes replace the transparent ones. One observer callback
 * firing twice beats a listener on every frame.
 *
 * A `<div>` rather than `<header>`: `ComposedPage` owns the landmark so the bar
 * is not nested inside another header.
 */
export function NavbarChrome({
  overHero,
  children,
}: {
  overHero: boolean;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (root === null) return;

    if (!overHero) {
      root.className = classes(false, true);
      return;
    }

    root.className = classes(true, false);
    const sentinel = document.getElementById(NAVBAR_SCROLL_SENTINEL_ID);
    if (sentinel === null) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry === undefined) return;
        root.className = classes(true, !entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [overHero]);

  return (
    <div ref={rootRef} className={classes(overHero, !overHero)}>
      {children}
    </div>
  );
}

function classes(overHero: boolean, scrolled: boolean): string {
  // Over a Hero the bar stays `fixed` for its whole life so toggling solid
  // never swaps positioning schemes and shifts the page.
  const position = overHero ? "fixed top-0 inset-x-0" : "sticky top-0";
  const surface =
    overHero && !scrolled
      ? "bg-transparent text-accent-contrast border-transparent"
      : "bg-surface text-text shadow-sm border-border";
  return (
    `${position} z-50 w-full border-b transition-[background-color,color,box-shadow,border-color] ` +
    surface
  );
}
