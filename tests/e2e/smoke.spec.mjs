import { test, expect } from "@playwright/test";

const LANGS = {
  en: "DevOps Consultant @AWS",
  es: "Consultor DevOps @AWS",
  pt: "Consultor DevOps @AWS",
};

test.describe("@smoke", () => {
  test("home page answers 200 with the resume title", async ({ page }) => {
    const response = await page.goto("/");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/html");
    await expect(page).toHaveTitle("Alex García - Resume");
  });

  test("content is visible at first paint, nothing is held at opacity 0", async ({
    page,
  }) => {
    // Sample cumulative opacity every frame from the start of the
    // navigation, the same way the original diagnosis did.
    await page.addInitScript(() => {
      window.__visibleAt = null;
      const tick = () => {
        const el = document.getElementById("mainArea");
        if (el) {
          let opacity = 1;
          for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
            opacity *= parseFloat(getComputedStyle(n).opacity);
          }
          if (opacity > 0.99 && el.getBoundingClientRect().height > 0) {
            window.__visibleAt = performance.now();
            return;
          }
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await page.goto("/");
    await page.waitForFunction(() => window.__visibleAt !== null, null, {
      timeout: 2000,
    });
    const { visibleAt, dcl } = await page.evaluate(() => ({
      visibleAt: window.__visibleAt,
      dcl: performance.getEntriesByType("navigation")[0]
        .domContentLoadedEventEnd,
    }));
    expect(visibleAt - dcl).toBeLessThan(500);

    const transparent = await page.evaluate(() =>
      [...document.querySelectorAll("#en-version *")]
        .filter((el) => getComputedStyle(el).opacity === "0")
        .map((el) => el.tagName + (el.id ? "#" + el.id : "")),
    );
    expect(transparent).toEqual([]);
    const animated = await page.evaluate(() => document.getAnimations().length);
    expect(animated).toBe(0);
  });

  for (const [lang, role] of Object.entries(LANGS)) {
    test(`renders the ${lang} version`, async ({ page }) => {
      await page.goto("/");
      await page.selectOption("#language-select", lang);
      const version = page.locator(`#${lang}-version`);
      await expect(version).toBeVisible();
      await expect(version.getByRole("heading", { level: 1 })).toHaveText(
        "Alex García",
      );
      await expect(version.locator(".role")).toHaveText(role);
      await expect(version.locator("section")).toHaveCount(4);
      await expect(page.locator("h1:visible")).toHaveCount(1);
    });
  }

  test("no horizontal overflow at 390 px and 320 px", async ({ page }) => {
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/");
      for (const lang of Object.keys(LANGS)) {
        await page.selectOption("#language-select", lang);
        const scrollWidth = await page.evaluate(
          () => document.documentElement.scrollWidth,
        );
        expect(scrollWidth, `${lang} at ${width}px`).toBeLessThanOrEqual(width);
      }
    }
  });

  test("static assets answer 200 with the right type", async ({ request }) => {
    const assets = {
      "/style.css": "text/css",
      "/main.js": "javascript",
      "/headshot.webp": "image/webp",
      "/headshot.jpg": "image/jpeg",
      "/favicon.svg": "image/svg+xml",
      "/fonts/lato-400.woff2": "font/woff2",
      "/fonts/rokkitt-variable.woff2": "font/woff2",
    };
    for (const [path, type] of Object.entries(assets)) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect(response.headers()["content-type"], path).toContain(type);
    }
  });

  test("error page renders and links back to the resume", async ({
    page,
    request,
  }) => {
    await page.goto("/error.html");
    await expect(page).toHaveTitle("Error - Alex García");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("404");
    const back = page.getByRole("link", { name: "Back to Resume" });
    await expect(back).toHaveAttribute("href", "/index.html");
    expect((await request.get("/index.html")).status()).toBe(200);
    const missing = await page.goto("/does-not-exist");
    expect(missing.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("404");
  });
});
