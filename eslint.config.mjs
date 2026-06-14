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
    // Raw Variant design exports — demo code, not app source (V2 revamp scratch)
    "variant-designs/**",
    // Legacy / separate-repo folders that live here during development
    "bayready/**",
    "bayready-ui-revamp/**",
  ]),
]);

export default eslintConfig;
