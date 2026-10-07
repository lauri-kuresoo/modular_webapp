/**
 * The first focusable element on every page. Targets the main landmark so a
 * keyboard or screen-reader Visitor can skip past the Navbar in one Tab.
 *
 * A Server Component: it is a plain anchor. Visible only on focus so it does
 * not compete with the Navbar's layout on a first paint.
 */
export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      className={
        "bg-surface text-text focus:ring-accent absolute top-0 left-0 z-100 " +
        "m-3 -translate-y-[200%] rounded-md px-4 py-2 text-sm font-medium " +
        "shadow-md transition focus:translate-y-0 focus:ring-2 focus:outline-none"
      }
    >
      {label}
    </a>
  );
}
