var SUPPORTED_LANGUAGES = ["en", "es", "pt"];
var DEFAULT_LANGUAGE = "en";
var STORAGE_KEY = "language";
var PRINT_DELAY_MS = 500;

function normalizeLanguage(lang) {
  return SUPPORTED_LANGUAGES.indexOf(lang) === -1 ? DEFAULT_LANGUAGE : lang;
}

// Storage can be unavailable (private browsing, blocked site data). The
// language switch must keep working without it.
function readStoredLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeLanguage(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Not persisted: the choice still applies to the current page view.
  }
}

// Show one language version, hide the others, and keep the document
// language and the selector in sync with what is on screen.
function showLanguage(lang) {
  SUPPORTED_LANGUAGES.forEach(function (code) {
    var version = document.getElementById(code + "-version");
    if (version) {
      version.hidden = code !== lang;
    }
  });
  document.documentElement.lang = lang;
  var select = document.getElementById("language-select");
  if (select) {
    select.value = lang;
  }
}

function changeLanguage(lang) {
  var language = normalizeLanguage(lang);
  showLanguage(language);
  storeLanguage(language);
  return language;
}

// PDF generation using the browser print dialog
function printResume(lang) {
  var language = normalizeLanguage(lang);
  var button = document.querySelector("#" + language + "-version .downloadBtn");
  // A second click while the dialog is being prepared is ignored, so the
  // button text and state are always restored from the original values.
  if (!button || button.disabled) {
    return;
  }

  var previousLanguage = normalizeLanguage(document.documentElement.lang);
  showLanguage(language);
  var originalText = button.textContent;
  button.textContent = "Preparing PDF...";
  button.disabled = true;
  button.setAttribute("aria-busy", "true");

  setTimeout(function () {
    try {
      window.print();
    } finally {
      button.textContent = originalText;
      button.disabled = false;
      button.removeAttribute("aria-busy");
      showLanguage(previousLanguage);
    }
  }, PRINT_DELAY_MS);
}

function init() {
  showLanguage(normalizeLanguage(readStoredLanguage()));

  var select = document.getElementById("language-select");
  if (select) {
    select.addEventListener("change", function () {
      changeLanguage(select.value);
    });
  }

  var buttons = document.querySelectorAll(".downloadBtn[data-lang]");
  Array.prototype.forEach.call(buttons, function (button) {
    button.addEventListener("click", function () {
      printResume(button.getAttribute("data-lang"));
    });
  });
}

window.changeLanguage = changeLanguage;
window.printResume = printResume;

init();
