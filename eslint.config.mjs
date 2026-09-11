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
  // The Next config is scoped to the apps; packages are plain TypeScript/React.
  ...next.map((config) => ({ ...config, files: ["apps/**/*.{ts,tsx}"] })),
];
