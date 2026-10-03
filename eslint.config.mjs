import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This app's client dashboards intentionally load remote data after mount.
      // Keep the new React 19 rule visible without treating these fetch effects
      // as release-blocking errors.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
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
