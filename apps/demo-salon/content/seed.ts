import type { TenantContent } from "@salon/core";

/**
 * Demo Tenant Content used when Firestore is not configured locally.
 *
 * Public traffic in production still comes from Firestore via `@salon/data`.
 * This seed exists so `pnpm dev` / `pnpm build` without a service account still
 * exercises every Section ticket 06 delivers, in both locales. A configured
 * `FIREBASE_SERVICE_ACCOUNT` overrides matching keys document-by-document.
 */
export const DEMO_CONTENT: TenantContent = {
  navbar: {
    brand: { et: "Demo Salong", en: "Demo Salon" },
    about: { et: "Meist", en: "About" },
    contact: { et: "Kontakt", en: "Contact" },
    book: { et: "Broneeri", en: "Book" },
  },
  hero: {
    heading: {
      et: "Rahulik ilu südalinnas",
      en: "Quiet beauty in the heart of the city",
    },
    lead: {
      et: "Juuksehooldus, näohooldus ja massaaž — ühes rahulikus stuudios, kus aeg jääb ukse taha.",
      en: "Hair, facial care and massage — in one calm studio where the clock stays at the door.",
    },
    ctaLabel: { et: "Broneeri aeg", en: "Book a visit" },
    imageSrc: { et: "/hero-premises.jpg" },
    imageAlt: {
      et: "Salongi sisevaade — valge tool ja pehme valgus",
      en: "Salon interior — a white chair in soft light",
    },
    imageWidth: { et: "1600" },
    imageHeight: { et: "1067" },
    imageBlurDataUrl: {
      et: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGfAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z",
    },
  },
  about: {
    heading: { et: "Meie lugu", en: "Our story" },
    body: {
      et: "Oleme väike salong, mis usub, et hea teenindus ei pea olema kiire ega lärmakas. Tule puhkama — meie tegeleme ülejäänuga.",
      en: "We are a small salon that believes good care does not have to be rushed or loud. Come to rest — we will take care of the rest.",
    },
  },
  "cta-band": {
    heading: { et: "Valmis järgmiseks visiidiks?", en: "Ready for your next visit?" },
    body: {
      et: "Broneeri sobiv aeg mõne klikiga. Kinnituse saad e-postiga.",
      en: "Book a time that suits you in a few clicks. You will get a confirmation by email.",
    },
    ctaLabel: { et: "Broneeri nüüd", en: "Book now" },
  },
  footer: {
    address: {
      et: "Näite 12\n10111 Tallinn",
      en: "Example 12\n10111 Tallinn",
    },
    phone: { et: "+372 5555 0101" },
    email: { et: "tere@demo-salon.example", en: "hello@demo-salon.example" },
    hours: {
      et: "E–R 10:00–19:00\nL 10:00–15:00\nP suletud",
      en: "Mon–Fri 10:00–19:00\nSat 10:00–15:00\nSun closed",
    },
    privacyLabel: { et: "Privaatsus", en: "Privacy" },
  },
};

/** Merge Firestore documents over the demo seed; stored documents win per anchor id. */
export function withDemoSeed(stored: TenantContent): TenantContent {
  return { ...DEMO_CONTENT, ...stored };
}
