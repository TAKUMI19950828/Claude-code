// Assemble the PV in two stages (robust against zoompan->xfade CFR issues):
//  Stage 1: render each scene to a constant-frame-rate mp4 with Ken-Burns zoom.
//  Stage 2: crossfade the scene clips together and add the theme song.
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("ffmpeg-static");

const FPS = 30;
const T = 0.8; // crossfade duration (s)
const here = __dirname;
const clipsDir = path.join(here, "clips");
fs.mkdirSync(clipsDir, { recursive: true });

const durations = [7.0, 7.5, 7.5, 6.5, 7.5, 6.5, 7.5, 6.5, 7.5, 7.5, 8.8, 8.5];
const transitions = [
  "fade", "fadewhite", "dissolve", "smoothleft", "dissolve",
  "smoothleft", "dissolve", "fadewhite", "fade", "fadewhite", "fade",
];
const N = durations.length;

function run(args, label) {
  const res = spawnSync(ffmpeg, args, { stdio: ["ignore", "pipe", "pipe"] });
  if (res.status !== 0) {
    console.error(`FAILED: ${label}`);
    console.error(res.stderr.toString().split("\n").slice(-12).join("\n"));
    process.exit(1);
  }
}

// ---- Stage 1: per-scene clips with zoom ----
for (let i = 0; i < N; i++) {
  const src = path.join(here, "frames", `f${String(i + 1).padStart(2, "0")}.png`);
  const dst = path.join(clipsDir, `c${String(i + 1).padStart(2, "0")}.mp4`);
  const DF = Math.round(durations[i] * FPS);
  const vf =
    `scale=2400:1350,setsar=1,` +
    `zoompan=z='1+0.08*on/${DF - 1}':d=${DF}:` +
    `x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=${FPS},` +
    `fps=${FPS},format=yuv420p`;
  if (fs.existsSync(dst) && fs.statSync(dst).size > 0) {
    console.log("clip", i + 1, "skip (exists)");
    continue;
  }
  // single (non-looped) image: zoompan d=DF sets the TOTAL output frame count
  run(
    [
      "-y", "-i", src, "-vf", vf, "-c:v", "libx264", "-preset", "veryfast",
      "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS), dst,
    ],
    `scene ${i + 1}`
  );
  console.log("clip", i + 1, "ok");
}

// ---- Stage 2: crossfade chain + audio ----
const inputs = [];
for (let i = 0; i < N; i++) inputs.push("-i", path.join(clipsDir, `c${String(i + 1).padStart(2, "0")}.mp4`));
inputs.push("-i", path.join(here, "song.mp3"));

// Clips are already constant-frame-rate 30fps/1920x1080 — feed them straight to
// xfade. (Any per-input fps/setpts/settb preprocessing corrupts the frame rate
// to 1/0 and breaks xfade, so we deliberately avoid it.)
const parts = [];
let acc = durations[0];
let last = "0:v";
for (let k = 1; k < N; k++) {
  const off = (acc - T).toFixed(3);
  const isLast = k === N - 1;
  const out = isLast ? "vout" : `x${k}`;
  const suffix = isLast ? ",format=yuv420p" : "";
  parts.push(`[${last}][${k}:v]xfade=transition=${transitions[k - 1]}:duration=${T}:offset=${off}${suffix}[${out}]`);
  last = out;
  acc = acc + durations[k] - T;
}
const total = acc.toFixed(2);
const fadeOutStart = (acc - 2.5).toFixed(2);
parts.push(`[${N}:a]afade=t=in:st=0:d=0.8,afade=t=out:st=${fadeOutStart}:d=2.5,aresample=48000[aout]`);

fs.writeFileSync(path.join(here, "filter.txt"), parts.join(";\n"));
console.log("total:", total, "s | fadeOut@", fadeOutStart);

const out = path.join(here, "shogi-musume-pv.mp4");
const res = spawnSync(
  ffmpeg,
  [
    "-y", ...inputs,
    "-filter_complex_script", path.join(here, "filter.txt"),
    "-map", "[vout]", "-map", "[aout]",
    "-c:v", "libx264", "-preset", "medium", "-crf", "20",
    "-pix_fmt", "yuv420p", "-r", String(FPS),
    "-c:a", "aac", "-b:a", "192k", "-t", total,
    "-movflags", "+faststart", out,
  ],
  { stdio: ["ignore", "inherit", "inherit"] }
);
process.exit(res.status ?? 1);
