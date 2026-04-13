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

const shouldRunStorybookTests = process.env.VITEST_ENABLE_STORYBOOK === "true";

const storybookProject = {
  extends: true as const,
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
    // Storybook browser tests require a local server, so keep them opt-in.
    storybookTest({ configDir: path.join(dirname, ".storybook") }),
  ],
  test: {
    browser: {
      api: {
        host: "127.0.0.1",
      },
      enabled: true,
      headless: true,
      instances: [{ browser: "chromium" as const }],
      provider: playwright({}),
    },
    name: "storybook",
    setupFiles: [".storybook/vitest.setup.ts"],
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
      ...(shouldRunStorybookTests ? [storybookProject] : []),
    ],
  },
});
