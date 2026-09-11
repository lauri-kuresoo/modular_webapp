import { Container } from "@salon/ui";

/**
 * Statically generated at build time, explicitly. Public traffic must cause zero
 * Firestore reads, so no page in a Site may render at request time.
 */
export const dynamic = "force-static";

/**
 * Hardcoded copy. Nothing on this page is configurable yet: the Composition file
 * arrives in ticket 03 and Firestore-backed Content in ticket 04.
 */
export default function HomePage() {
  return (
    <main className="py-20">
      <Container width="prose">
        <p className="text-sm font-medium tracking-widest text-neutral-500 uppercase">Demo Salon</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          A salon website that its owner can actually keep up to date.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-neutral-600">
          This is the reference Site for the modular salon platform. It is assembled from registered
          Sections rather than written by hand, and it is statically generated, so it loads on
          mobile data before a visitor gives up.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-neutral-600">
          Right now it renders one paragraph of hardcoded copy. Themes, Sections, Content and
          booking arrive in the tickets that build on this skeleton.
        </p>
      </Container>
    </main>
  );
}
