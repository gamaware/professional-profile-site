import { test, expect } from "@playwright/test";

function collectErrors(page) {
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });
  return errors;
}

test("defaults to English with html lang en", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#en-version")).toBeVisible();
  await expect(page.locator("#es-version")).toBeHidden();
  await expect(page.locator("#pt-version")).toBeHidden();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("language choice updates html lang and persists across reload", async ({
  page,
}) => {
  await page.goto("/");
  for (const lang of ["es", "pt", "en", "pt"]) {
    await page.selectOption("#language-select", lang);
    await expect(page.locator(`#${lang}-version`)).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
  }
  await page.reload();
  await expect(page.locator("#pt-version")).toBeVisible();
  await expect(page.locator("#en-version")).toBeHidden();
  await expect(page.locator("#language-select")).toHaveValue("pt");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt");
  expect(await page.evaluate(() => localStorage.getItem("language"))).toBe(
    "pt",
  );
});

test("an unsupported stored language falls back to English without errors", async ({
  page,
}) => {
  const errors = collectErrors(page);
  await page.addInitScript(() => localStorage.setItem("language", "fr"));
  await page.goto("/");
  await expect(page.locator("#en-version")).toBeVisible();
  await expect(page.locator("#language-select")).toHaveValue("en");
  expect(errors).toEqual([]);
});

test("language select is labeled and keyboard operable", async ({ page }) => {
  await page.goto("/");
  const select = page.getByRole("combobox", { name: /language/i });
  await expect(select).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(select).toBeFocused();
  const outline = await select.evaluate(
    (el) => getComputedStyle(el).outlineStyle,
  );
  expect(outline).toBe("solid");

  // Keyboard selection: focus the select and choose by typing.
  await select.focus();
  await page.keyboard.type("Es");
  await expect(page.locator("#es-version")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");

  // Tab continues into the visible version only.
  await page.keyboard.press("Tab");
  const focusedInVersion = await page.evaluate(
    () => document.activeElement.closest("main")?.id,
  );
  expect(focusedInVersion).toBe("es-version");
});

test("download button shows a busy state and calls window.print", async ({
  page,
}) => {
  await page.goto("/");
  await page.selectOption("#language-select", "es");
  await page.evaluate(() => {
    window.__printed = [];
    window.print = () => window.__printed.push(document.documentElement.lang);
  });
  const button = page.locator("#es-version .downloadBtn");
  const label = (await button.textContent()).trim();
  await button.click();
  await expect(button).toHaveText("Preparing PDF...");
  await expect(button).toBeDisabled();
  await expect
    .poll(() => page.evaluate(() => window.__printed))
    .toEqual(["es"]);
  await expect(button).toHaveText(label);
  await expect(button).toBeEnabled();
  await expect(page.locator("#es-version")).toBeVisible();
});

test("print media hides the controls and fits the PDF on two A4 pages", async ({
  page,
}) => {
  await page.goto("/");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("#controls")).toBeHidden();
  await expect(page.locator("#downloadSection")).toBeHidden();
  for (const lang of ["en", "es", "pt"]) {
    await page.evaluate((l) => window.changeLanguage(l), lang);
    const pdf = await page.pdf({ format: "A4", preferCSSPageSize: true });
    const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || [])
      .length;
    expect(pages, lang).toBeGreaterThanOrEqual(1);
    expect(pages, lang).toBeLessThanOrEqual(2);
  }
});

test("links are valid and safe", async ({ page, request }) => {
  await page.goto("/");
  const links = await page.$$eval("a[href]", (as) =>
    as.map((a) => ({
      href: a.getAttribute("href"),
      target: a.getAttribute("target"),
      rel: a.getAttribute("rel") || "",
    })),
  );
  expect(links.length).toBeGreaterThan(0);
  for (const link of links) {
    expect(link.href, "no javascript: links").not.toMatch(/^javascript:/i);
    if (link.href.startsWith("#")) {
      const id = link.href.slice(1);
      expect(await page.locator(`[id="${id}"]`).count(), link.href).toBe(1);
    } else if (/^https?:/.test(link.href)) {
      expect(link.href, "external links use https").toMatch(/^https:/);
    } else if (!link.href.startsWith("mailto:")) {
      expect((await request.get(link.href)).status(), link.href).toBe(200);
    }
    if (link.target === "_blank") {
      expect(link.rel.split(/\s+/), link.href).toContain("noopener");
    }
  }
  const emails = links.filter((l) => l.href.startsWith("mailto:"));
  expect(emails.map((l) => l.href)).toEqual(
    Array(3).fill("mailto:gamaware@gmail.com"),
  );
  expect(links.some((l) => /upwork/i.test(l.href))).toBe(false);
});

test("headshot has alt text, loads, and is not oversized", async ({ page }) => {
  await page.goto("/");
  const img = page.locator("#headshot img");
  await expect(img).toHaveAttribute("alt", "Alex García");
  await expect(img).toBeVisible();
  const { natural, rendered, src } = await img.evaluate(async (el) => {
    await el.decode();
    return {
      natural: el.naturalWidth,
      rendered: el.getBoundingClientRect().width,
      src: el.currentSrc,
    };
  });
  expect(natural).toBeGreaterThan(0);
  expect(natural).toBeLessThanOrEqual(rendered * 3);
  expect(src).toMatch(/headshot\.webp$/);
  const missingAlt = await page.$$eval(
    "img",
    (imgs) => imgs.filter((i) => !i.getAttribute("alt")).length,
  );
  expect(missingAlt).toBe(0);
});

test("no console errors or failed requests", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  for (const lang of ["es", "pt", "en"]) {
    await page.selectOption("#language-select", lang);
  }
  expect(errors).toEqual([]);
});

for (const colorScheme of ["light", "dark"]) {
  test(`text contrast meets WCAG AA in ${colorScheme} mode`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ colorScheme });
    const page = await context.newPage();
    await page.goto("/");
    const failures = await page.evaluate(() => {
      const parse = (c) => {
        const m = c.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).map(Number);
        return { r, g, b, a };
      };
      const lum = ({ r, g, b }) => {
        const f = (v) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const background = (el) => {
        for (let n = el; n; n = n.parentElement) {
          const c = parse(getComputedStyle(n).backgroundColor);
          if (c && c.a > 0) return c;
        }
        return parse(getComputedStyle(document.body).backgroundColor);
      };
      const selectors = [
        "#en-version h1",
        "#en-version .role",
        "#en-version .contactDetails a",
        "#en-version .contactLabel",
        "#en-version .sectionTitle",
        "#en-version h3",
        "#en-version .subDetails",
        "#en-version .sectionContent p",
        "#en-version .keySkills li",
        "#en-version .downloadBtn",
        "#en-version .last-updated",
        "#language-select",
      ];
      const out = [];
      for (const sel of selectors) {
        for (const el of document.querySelectorAll(sel)) {
          const style = getComputedStyle(el);
          const fg = parse(style.color);
          const bg = background(el);
          const [l1, l2] = [lum(fg), lum(bg)].sort((a, b) => b - a);
          const ratio = (l1 + 0.05) / (l2 + 0.05);
          const size = parseFloat(style.fontSize);
          const bold = Number(style.fontWeight) >= 700;
          const large = size >= 24 || (bold && size >= 18.66);
          if (ratio < (large ? 3 : 4.5)) {
            out.push(`${sel}: ${ratio.toFixed(2)}`);
          }
        }
      }
      return out;
    });
    await context.close();
    expect(failures).toEqual([]);
  });
}
