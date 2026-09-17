import type { Locale } from "@salon/core";
import { en } from "./en";
import { et, type UiMessages } from "./et";

/** Every locale's dictionary, for a Site to hand to `next-intl` per request. */
export const UI_MESSAGES = { et, en } satisfies Record<Locale, UiMessages>;

/**
 * Teaches `next-intl` what this platform's keys and locales are, so
 * `t("localeSwitcher.labl")` is a compile error rather than a string rendered
 * into the page. The augmentation is global; importing this module anywhere in a
 * `tsc` program is what switches the checking on for the whole program.
 */
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: UiMessages;
  }
}
