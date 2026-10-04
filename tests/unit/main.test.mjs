// Unit tests for main.js: run the real script against the real index.html
// markup in a happy-dom window, with storage, timers and print stubbed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Window } from "happy-dom";

const ROOT = new URL("../../", import.meta.url);
const HTML = readFileSync(new URL("index.html", ROOT), "utf8").replace(
  /<script\b[^>]*><\/script>/g,
  "",
);
const MAIN_JS = readFileSync(new URL("main.js", ROOT), "utf8");
const LANGS = ["en", "es", "pt"];

function makeStorage(initial = {}, { throws = false } = {}) {
  const data = new Map(Object.entries(initial));
  const calls = { get: 0, set: [] };
  return {
    calls,
    getItem(key) {
      calls.get += 1;
      if (throws) throw new Error("SecurityError: storage blocked");
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      calls.set.push([key, value]);
      if (throws) throw new Error("SecurityError: storage blocked");
      data.set(key, String(value));
    },
    data,
  };
}

function load({ stored, storageThrows = false } = {}) {
  const window = new Window({
    url: "http://localhost/",
    settings: {
      disableJavaScriptFileLoading: true,
      disableCSSFileLoading: true,
    },
  });
  window.document.write(HTML);
  const storage = makeStorage(
    stored === undefined ? {} : { language: stored },
    { throws: storageThrows },
  );
  const timers = [];
  const fakeSetTimeout = (fn, ms) => timers.push({ fn, ms });
  const printCalls = [];
  window.print = () => printCalls.push(window.document.documentElement.lang);

  // Same globals the browser gives the classic script.
  const run = new Function(
    "window",
    "document",
    "localStorage",
    "setTimeout",
    MAIN_JS,
  );
  run(window, window.document, storage, fakeSetTimeout);

  const doc = window.document;
  return {
    window,
    doc,
    storage,
    timers,
    printCalls,
    flushTimers() {
      while (timers.length) timers.shift().fn();
    },
    visible() {
      return LANGS.filter((l) => !doc.getElementById(`${l}-version`).hidden);
    },
    select: doc.getElementById("language-select"),
    button: (l) => doc.querySelector(`#${l}-version .downloadBtn`),
  };
}

test("exposes the functions the page calls", () => {
  const t = load();
  assert.equal(typeof t.window.changeLanguage, "function");
  assert.equal(typeof t.window.printResume, "function");
});

test("default: English visible, html lang en, nothing stored", () => {
  const t = load();
  assert.deepEqual(t.visible(), ["en"]);
  assert.equal(t.doc.documentElement.lang, "en");
  assert.equal(t.select.value, "en");
  assert.deepEqual(t.storage.calls.set, []);
});

for (const lang of LANGS) {
  test(`changeLanguage('${lang}') shows only ${lang}, stores it and sets html lang`, () => {
    const t = load();
    t.window.changeLanguage(lang);
    assert.deepEqual(t.visible(), [lang]);
    assert.equal(t.doc.documentElement.lang, lang);
    assert.equal(t.select.value, lang);
    assert.equal(t.storage.data.get("language"), lang);
  });
}

for (const bad of ["fr", "", undefined, null, "ES", "en-US", "__proto__"]) {
  test(`changeLanguage(${JSON.stringify(bad)}) falls back to English`, () => {
    const t = load();
    t.window.changeLanguage("pt");
    assert.doesNotThrow(() => t.window.changeLanguage(bad));
    assert.deepEqual(t.visible(), ["en"]);
    assert.equal(t.doc.documentElement.lang, "en");
    assert.equal(t.storage.data.get("language"), "en");
  });
}

test("restores a saved language on load", () => {
  const t = load({ stored: "pt" });
  assert.deepEqual(t.visible(), ["pt"]);
  assert.equal(t.select.value, "pt");
  assert.equal(t.doc.documentElement.lang, "pt");
  assert.deepEqual(t.storage.calls.set, [], "restoring does not write");
});

test("a saved unsupported value restores English and resets the select", () => {
  const t = load({ stored: "xx" });
  assert.deepEqual(t.visible(), ["en"]);
  assert.equal(t.select.value, "en");
  assert.equal(t.doc.documentElement.lang, "en");
});

test("blocked storage: loading and switching still work", () => {
  let t;
  assert.doesNotThrow(() => {
    t = load({ storageThrows: true });
  });
  assert.deepEqual(t.visible(), ["en"]);
  assert.doesNotThrow(() => t.window.changeLanguage("es"));
  assert.deepEqual(t.visible(), ["es"]);
  assert.equal(t.doc.documentElement.lang, "es");
});

test("the select change event switches language", () => {
  const t = load();
  t.select.value = "es";
  t.select.dispatchEvent(new t.window.Event("change"));
  assert.deepEqual(t.visible(), ["es"]);
  assert.equal(t.storage.data.get("language"), "es");
});

test("printResume: busy state before the timer, print and restore after", () => {
  const t = load({ stored: "es" });
  const button = t.button("es");
  const original = button.textContent;

  t.window.printResume("es");
  assert.equal(button.textContent, "Preparing PDF...");
  assert.equal(button.disabled, true);
  assert.equal(button.getAttribute("aria-busy"), "true");
  assert.equal(t.printCalls.length, 0, "print waits for the timer");
  assert.equal(t.timers[0].ms, 500);

  t.flushTimers();
  assert.deepEqual(t.printCalls, ["es"], "printed once, in Spanish");
  assert.equal(button.textContent, original);
  assert.equal(button.disabled, false);
  assert.equal(button.hasAttribute("aria-busy"), false);
  assert.deepEqual(t.visible(), ["es"]);
});

test("printResume restores the previously visible language", () => {
  const t = load();
  t.window.changeLanguage("pt");
  t.window.printResume("en");
  assert.deepEqual(t.visible(), ["en"]);
  t.flushTimers();
  assert.deepEqual(t.printCalls, ["en"]);
  assert.deepEqual(t.visible(), ["pt"]);
  assert.equal(t.doc.documentElement.lang, "pt");
});

// Regression: a language picked during the print delay used to be
// overwritten by the restore, leaving the page and storage out of sync.
test("printResume locks the language select until the print finishes", () => {
  const t = load({ stored: "pt" });
  t.window.printResume("en");
  assert.equal(t.select.disabled, true, "select is locked during the delay");
  t.flushTimers();
  assert.deepEqual(t.printCalls, ["en"]);
  assert.equal(t.select.disabled, false, "select is unlocked afterwards");
  assert.deepEqual(t.visible(), ["pt"]);
  assert.equal(t.select.value, "pt");
  assert.equal(t.storage.data.get("language"), "pt");
});

test("printResume keeps a select that was already disabled disabled", () => {
  const t = load();
  t.select.disabled = true;
  t.window.printResume("en");
  t.flushTimers();
  assert.equal(t.select.disabled, true);
});

test("printResume restores the button even if print throws", () => {
  const t = load();
  t.window.print = () => {
    throw new Error("print blocked");
  };
  const button = t.button("en");
  const original = button.textContent;
  t.window.printResume("en");
  assert.throws(() => t.flushTimers(), /print blocked/);
  assert.equal(button.textContent, original);
  assert.equal(button.disabled, false);
  assert.equal(t.select.disabled, false);
});

test("printResume with an unsupported code prints English without throwing", () => {
  const t = load();
  assert.doesNotThrow(() => t.window.printResume("xx"));
  t.flushTimers();
  assert.deepEqual(t.printCalls, ["en"]);
});

test("printResume twice quickly schedules one print and keeps the label", () => {
  const t = load();
  const button = t.button("en");
  const original = button.textContent;
  t.window.printResume("en");
  t.window.printResume("en");
  assert.equal(t.timers.length, 1);
  t.flushTimers();
  assert.equal(t.printCalls.length, 1);
  assert.equal(button.textContent, original);
  assert.equal(button.disabled, false);
});

test("clicking a download button prints that language", () => {
  const t = load();
  t.window.changeLanguage("pt");
  t.button("pt").click();
  t.flushTimers();
  assert.deepEqual(t.printCalls, ["pt"]);
});
