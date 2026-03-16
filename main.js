var SUPPORTED_LANGUAGES = ["en", "es", "pt"];

// Language selector functionality
function changeLanguage(lang) {
  if (SUPPORTED_LANGUAGES.indexOf(lang) === -1) {
    lang = "en";
  }

  document.getElementById("en-version").style.display = "none";
  document.getElementById("es-version").style.display = "none";
  document.getElementById("pt-version").style.display = "none";

  document.getElementById(lang + "-version").style.display = "block";

  localStorage.setItem("language", lang);
}

// PDF generation using browser print
function printResume(lang) {
  document.getElementById("en-version").style.display = "none";
  document.getElementById("es-version").style.display = "none";
  document.getElementById("pt-version").style.display = "none";
  document.getElementById(lang + "-version").style.display = "block";

  var downloadBtn = document.querySelector(
    "#" + lang + "-version .downloadBtn",
  );
  if (!downloadBtn) return;
  var originalText = downloadBtn.textContent;
  downloadBtn.textContent = "Preparing PDF...";
  downloadBtn.disabled = true;

  setTimeout(function () {
    window.print();

    downloadBtn.textContent = originalText;
    downloadBtn.disabled = false;

    var savedLanguage = localStorage.getItem("language") || "en";
    changeLanguage(savedLanguage);
  }, 500);
}

// Expose HTML-called functions to global scope
window.changeLanguage = changeLanguage;
window.printResume = printResume;

// Restore saved language preference
(function () {
  var savedLanguage = localStorage.getItem("language");
  if (savedLanguage) {
    document.getElementById("language-select").value = savedLanguage;
    changeLanguage(savedLanguage);
  }
})();
