/**
 * `@salon/ui` — Sections, chrome and primitives.
 *
 * May depend on `@salon/core` and `@salon/theme`. Must never import
 * `@salon/data`: Sections receive Content as props from the app layer.
 * The Section Registry lands in ticket 03, the Sections themselves in 06–09.
 *
 * No component here accepts a colour, a `className` or a `style`. Everything
 * visual comes from the Theme tokens through Tailwind utilities, which is what
 * makes a Section themeable without knowing which Theme is active.
 */
export { Container, type ContainerProps, type ContainerWidth } from "./primitives/container";
export { Button, type ButtonProps, type ButtonVariant } from "./primitives/button";
export { Card, type CardElevation, type CardProps } from "./primitives/card";
