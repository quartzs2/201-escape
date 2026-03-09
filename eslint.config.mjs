import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import perfectionist from "eslint-plugin-perfectionist";
// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig, globalIgnores } from "eslint/config";

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
    // Build outputs:
    "storybook-static/**",
  ]),
  {
    plugins: {
      "unused-imports": unusedImports,
    },
  },
  perfectionist.configs["recommended-natural"],
  ...storybook.configs["flat/recommended"],
  eslintConfigPrettier,
  {
    rules: {
      curly: ["error", "all"],
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "function-declaration",
          unnamedComponents: "arrow-function",
        },
      ],
      "unused-imports/no-unused-imports": "error",
    },
  },
]);

export default eslintConfig;
