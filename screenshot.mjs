import puppeteer from "puppeteer";
import { existsSync } from "node:fs";

var url = process.argv[2] || "http://localhost:3000";
var widths = [1280, 375];

(async function () {
  var browser = await puppeteer.launch({ headless: true });
  try {
    var page = await browser.newPage();

    for (var w = 0; w < widths.length; w++) {
      var width = widths[w];
      await page.setViewport({ width: width, height: 900 });
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

      await page.evaluate(async function () {
        var distance = 300;
        var delay = 100;
        var height = document.body.scrollHeight;
        var pos = 0;
        while (pos < height) {
          window.scrollBy(0, distance);
          pos += distance;
          await new Promise(function (r) {
            setTimeout(r, delay);
          });
        }
        window.scrollTo(0, 0);
        await new Promise(function (r) {
          setTimeout(r, 500);
        });
      });

      var n = 1;
      while (existsSync("screenshot-" + width + "-" + n + ".png")) {
        n++;
      }

      var filename = "screenshot-" + width + "-" + n + ".png";
      await page.screenshot({ path: filename, fullPage: true });
      console.log("Saved " + filename);
    }
  } finally {
    await browser.close();
  }
})();
