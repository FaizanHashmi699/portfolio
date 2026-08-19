import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated output — not our source, and linting it produces noise only.
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    // The previous owner's HTML/CSS assignment, kept for history.
    "legacy/**",
  ]),
]);

export default eslintConfig;
