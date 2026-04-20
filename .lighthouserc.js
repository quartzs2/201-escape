const DEFAULT_BASE_URL = "http://localhost:3000";

const baseUrl = (process.env.LHCI_BASE_URL ?? DEFAULT_BASE_URL).replace(
  /\/+$/,
  "",
);
const baseHostname = new URL(baseUrl).hostname;
const isLocalMeasure =
  baseHostname === "localhost" || baseHostname === "127.0.0.1";
const vercelAutomationBypassSecret =
  process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const extraHeaders = vercelAutomationBypassSecret
  ? {
      "x-vercel-protection-bypass": vercelAutomationBypassSecret,
      "x-vercel-set-bypass-cookie": "true",
    }
  : undefined;

/** @type {import('@lhci/cli').LighthouseRcConfig} */
module.exports = {
  ci: {
    assert: {
      assertions: {
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
      },
    },
    collect: {
      chromePath: process.env.CHROMIUM_PATH,
      numberOfRuns: 3,
      outputDir: process.env.GITHUB_WORKSPACE
        ? `${process.env.GITHUB_WORKSPACE}/.lighthouseci`
        : ".lighthouseci",
      puppeteerLaunchOptions: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
      puppeteerScript: "./lighthouse-auth.js",
      settings: extraHeaders
        ? {
            extraHeaders,
          }
        : {},
      ...(isLocalMeasure
        ? {
            startServerCommand: "pnpm start",
            startServerReadyPattern: "Ready in",
          }
        : {}),
      url: [
        baseUrl,
        `${baseUrl}/login`,
        `${baseUrl}/dashboard`,
        `${baseUrl}/applications`,
      ],
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
