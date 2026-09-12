/**
 * `@salon/ui` — Sections, chrome and primitives.
 *
 * May depend on `@salon/core` and `@salon/theme`. Must never import
 * `@salon/data`: Sections receive Content as props from the app layer.
 * The Section Registry lands in ticket 03, the Sections themselves in 06–09.
 */
export { Container, type ContainerProps, type ContainerWidth } from "./primitives/container";
