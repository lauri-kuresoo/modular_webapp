import { Button, Card, Container } from "@salon/ui";
import { THEME_PRESETS } from "@salon/theme";
import { SITE_THEME } from "../site.config";

/**
 * Statically generated at build time, explicitly. Public traffic must cause zero
 * Firestore reads, so no page in a Site may render at request time.
 */
export const dynamic = "force-static";

const preset = THEME_PRESETS[SITE_THEME];

/**
 * Hardcoded copy. Nothing on this page is configurable yet: the Composition file
 * arrives in ticket 03 and Firestore-backed Content in ticket 04.
 *
 * Until then it doubles as the Theme specimen — every token this page shows is
 * read through a Tailwind utility, never a colour value, so switching
 * `SITE_THEME` is the only edit needed to see the whole contract change. Ticket
 * 26 turns this idea into a proper gallery across every Section and preset.
 */
export default function HomePage() {
  return (
    <main className="py-20">
      <Container width="prose">
        <p className="text-text-muted text-sm font-medium tracking-widest uppercase">Demo Salon</p>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          A salon website that its owner can actually keep up to date.
        </h1>
        <p className="text-text-muted mt-6 text-lg">
          This is the reference Site for the modular salon platform. It is assembled from registered
          Sections rather than written by hand, and it is statically generated, so it loads on
          mobile data before a visitor gives up.
        </p>
        <p className="text-text-muted mt-4 text-lg">
          It is rendering in the <strong className="text-text">{preset.label}</strong> Theme, which
          follows your operating system&rsquo;s light or dark preference. Every colour, radius, font
          and spacing step below comes from that Theme; no component here knows which one is active.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button variant="primary">Book an appointment</Button>
          <Button variant="subtle">See our services</Button>
          <Button variant="ghost">Call us</Button>
        </div>

        <div className="mt-10">
          <Card>
            <h2 className="font-display text-xl font-semibold">Theme specimen</h2>
            <p className="text-text-muted mt-2">
              A raised surface, the Theme&rsquo;s border, its large radius and its shadow level.
            </p>
            <hr className="border-border my-6" />
            <p className="text-success">Confirmed — we will see you on Tuesday.</p>
            <p className="text-danger mt-1">
              That time is no longer available. Please choose another.
            </p>
          </Card>
        </div>
      </Container>
    </main>
  );
}
