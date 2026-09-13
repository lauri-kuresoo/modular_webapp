/**
 * `@salon/core` — the domain vocabulary of spec 0001, and nothing else.
 *
 * Depends on no other workspace package. Everything else may depend on it.
 * This file is the seed: branded identifiers, the locale contract and the
 * shape of stored Content. Later tickets add the Tenant, Service, Staff and
 * Booking schemas here.
 */

/** Nominal typing helper, so a `StaffId` is never accepted where a `ServiceId` belongs. */
declare const brand: unique symbol;
export type Branded<T, B extends string> = T & { readonly [brand]: B };

export type TenantId = Branded<string, "TenantId">;
export type ServiceId = Branded<string, "ServiceId">;
export type StaffId = Branded<string, "StaffId">;
export type BookingId = Branded<string, "BookingId">;

export const tenantId = (value: string): TenantId => value as TenantId;
export const serviceId = (value: string): ServiceId => value as ServiceId;
export const staffId = (value: string): StaffId => value as StaffId;
export const bookingId = (value: string): BookingId => value as BookingId;

export { LOCALES, DEFAULT_LOCALE, localeSchema, type Locale } from "./locale";
export {
  contentDocumentSchema,
  type SectionContent,
  type TenantContent,
} from "./content";
