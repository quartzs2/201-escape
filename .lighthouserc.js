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
      startServerCommand: "pnpm start",
      startServerReadyPattern: "Ready in",
      url: [
        "http://localhost:3000",
        "http://localhost:3000/login",
        "http://localhost:3000/dashboard",
      ],
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
