// Language selector functionality
function changeLanguage(lang) {
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

// Restore saved language preference
(function () {
  var savedLanguage = localStorage.getItem("language");
  if (savedLanguage) {
    document.getElementById("language-select").value = savedLanguage;
    changeLanguage(savedLanguage);
  }
})();
