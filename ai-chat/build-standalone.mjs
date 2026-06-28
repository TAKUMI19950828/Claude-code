/* ===========================================================
   build-standalone.mjs
   分割ファイル（index.html / style.css / app.js / assets）から、
   1ファイルで完結する eruru-chat.html を生成します。

   使い方:  node build-standalone.mjs
   =========================================================== */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(here, p), "utf8");

let html = read("index.html");
const css = read("style.css");
const js = read("app.js");

// 1) style.css を <style> に差し込み
html = html.replace(
  /<link rel="stylesheet" href="style\.css"\s*\/?>/,
  `<style>\n${css}\n</style>`
);

// 2) app.js を <script> に差し込み
html = html.replace(
  /<script src="app\.js"><\/script>/,
  `<script>\n${js}\n</script>`
);

// 3) assets/ の立ち絵を base64 データURIに置換
const assetsDir = join(here, "assets");
const pngs = readdirSync(assetsDir).filter((f) => f.toLowerCase().endsWith(".png"));
let embedded = 0;
for (const file of pngs) {
  const rel = `assets/${file}`;
  if (!html.includes(rel)) continue; // 参照されていない画像は埋め込まない
  const b64 = readFileSync(join(assetsDir, file)).toString("base64");
  const dataUri = `data:image/png;base64,${b64}`;
  html = html.split(rel).join(dataUri);
  embedded++;
}

const outPath = join(here, "eruru-chat.html");
writeFileSync(outPath, html);

const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`✓ eruru-chat.html を生成しました（画像 ${embedded} 枚を埋め込み, 約 ${kb} KB）`);
