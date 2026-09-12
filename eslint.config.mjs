// Root flat config. ESLint searches ancestor directories for this file, so each
// workspace package's `lint` script (`eslint .`) picks it up without its own copy.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import next from "eslint-config-next";

export default [
  {
    ignores: ["**/node_modules/**", "**/.next/**", "**/.turbo/**", "**/dist/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // `eslint-config-next` ships two file-scoped rule entries plus one that carries
  // *only* `ignores` (`.next/**`, `out/**`, `build/**`, `next-env.d.ts`). Those two
  // kinds need opposite treatment:
  //
  //   - The rule entries get re-scoped to the apps; packages are plain TypeScript/React.
  //   - The ignores-only entry must keep having no `files` key. In flat config an
  //     object with only `ignores` is a *global* ignore; adding `files` demotes it to
  //     an ordinary file-scoped config and Next's generated output silently starts
  //     getting linted. Its patterns are also written for an app root, while flat-config
  //     `ignores` resolve against the directory holding this file — the repo root — so
  //     they are re-anchored under `apps/` to keep matching.
  ...next.map((config) =>
    config.files
      ? { ...config, files: ["apps/**/*.{ts,tsx}"] }
      : { ...config, ignores: config.ignores.map((p) => `apps/**/${p}`) },
  ),
];
