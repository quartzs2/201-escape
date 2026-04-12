import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const pathAlias = {
  resolve: {
    alias: {
      "@": path.resolve(dirname, "."),
    },
  },
};

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    benchmark: {
      include: [],
    },
    projects: [
      {
        ...pathAlias,
        test: {
          environment: "node",
          include: [
            "lib/utils/**/*.test.ts",
            "lib/adapters/**/*.test.ts",
            "lib/actions/**/*.test.ts",
          ],
          name: "unit",
        },
      },
      {
        ...pathAlias,
        test: {
          environment: "jsdom",
          include: ["hooks/**/*.test.ts"],
          name: "dom",
        },
      },
      {
        extends: true,
        optimizeDeps: {
          include: [
            "@radix-ui/react-slot",
            "@tanstack/react-query",
            "class-variance-authority",
            "clsx",
            "next/navigation",
            "posthog-js",
            "posthog-js/react",
            "react",
            "react-dom",
            "tailwind-merge",
          ],
        },
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: "chromium" }],
            provider: playwright({}),
          },
          name: "storybook",
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
