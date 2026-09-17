/**
 * `@salon/ui` — Sections, chrome and primitives.
 *
 * May depend on `@salon/core` and `@salon/theme`. Must never import
 * `@salon/data`: Sections receive Content as props from the app layer.
 * The Sections themselves land in tickets 06–09.
 *
 * No component here accepts a colour, a `className` or a `style`. Everything
 * visual comes from the Theme tokens through Tailwind utilities, which is what
 * makes a Section themeable without knowing which Theme is active.
 *
 * The Section Registry is deliberately not exported. A Site composes a page
 * through `defineComposition` and `ComposedPage`; registering a Section is an
 * edit inside this package.
 *
 * This is one of the package's three entry points, and it is the one a page
 * imports in order to render, so nothing reachable from here may reach a
 * `"use client"` module — a page that wants a `Container` would pay for it.
 * `@salon/ui/chrome` holds the components that are client components, and
 * `@salon/ui/seo` the metadata helpers, which reach one without rendering it.
 * `@salon/ui/i18n` is split off for a different reason: `proxy.ts` and
 * `i18n/request.ts` read the routing policy and the dictionaries from outside
 * React, and neither should drag a Section into its bundle.
 */
export { Container, type ContainerProps, type ContainerWidth } from "./primitives/container";
export { Button, type ButtonProps, type ButtonVariant } from "./primitives/button";
export { Card, type CardElevation, type CardProps } from "./primitives/card";

export { defineComposition, type Composition } from "./sections/composition";
export { ComposedPage } from "./sections/composed-page";
