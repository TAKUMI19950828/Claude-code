// Render each PV scene as a 1920x1080 PNG using the styled HTML.
const { chromium } = require("playwright-core");
const path = require("path");

(async () => {
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const url = "file://" + path.resolve(__dirname, "frames.html");
  await page.goto(url, { waitUntil: "networkidle" });

  const count = await page.evaluate(() => document.querySelectorAll(".scene").length);
  for (let i = 1; i <= count; i++) {
    await page.evaluate((n) => {
      document.querySelectorAll(".scene").forEach((el) => el.classList.remove("on"));
      document.querySelector(`.scene[data-s="${n}"]`).classList.add("on");
    }, i);
    // make sure all images inside the active scene are decoded
    await page.evaluate(async () => {
      const imgs = [...document.querySelectorAll(".scene.on img")];
      await Promise.all(
        imgs.map((im) =>
          im.complete && im.naturalWidth
            ? Promise.resolve()
            : new Promise((res) => {
                im.onload = im.onerror = res;
              })
        )
      );
    });
    await page.waitForTimeout(200);
    const out = path.resolve(__dirname, "frames", `f${String(i).padStart(2, "0")}.png`);
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
    console.log("rendered", out);
  }
  await browser.close();
})();
