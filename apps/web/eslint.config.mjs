import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    // Security guardrails (see docs/PRD.md and the auth plan).
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          // getSession() trusts the cookie without verifying the token. Use getClaims().
          selector: "MemberExpression[object.property.name='auth'][property.name='getSession']",
          message: "Use supabase.auth.getClaims() (verified) instead of getSession() for identity.",
        },
      ],
    },
  },
  {
    // Signed-in pages and data code must never opt into shared caching: it could serve one
    // person's data to another.
    files: ["src/app/app/**", "src/app/advisor/**", "src/lib/data/**", "src/lib/auth/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExpressionStatement[directive=/^use cache/]",
          message: "No 'use cache' in signed-in code: personal data must be rendered per request.",
        },
        {
          selector: "MemberExpression[object.property.name='auth'][property.name='getSession']",
          message: "Use supabase.auth.getClaims() (verified) instead of getSession() for identity.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
