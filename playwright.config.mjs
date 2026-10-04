import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
// Set BASE_URL to run the suite against a deployed site instead.
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "node tests/server.mjs",
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        env: { PORT: String(PORT) },
      },
});
