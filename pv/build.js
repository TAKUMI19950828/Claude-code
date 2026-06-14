// Assemble the PV in two stages:
//  Stage 1: render each scene to a constant-frame-rate mp4 with gentle motion
//           (Ken-Burns zoom / pan / drift). To avoid the integer-pixel "jitter"
//           that zoompan produces at low resolution, we supersample the source
//           to 3x (5760x3240) before zoompan, so per-frame movement maps to
//           sub-pixel steps in the 1920x1080 output and reads as smooth.
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

const durations = [6.0, 7.5, 6.5, 6.5, 7.5, 6.5, 6.5, 7.5, 6.5, 6.5, 6.5, 7.5, 8.1];
// Per-scene motion preset:
//   logo=zoom, characters=motion-path(drift), rewards=zoom/pan, ensemble/end=zoom
const motions = [
  "zoomin",  // 01 title logo
  "drift",   // 02 eruru profile  (character: motion path)
  "zoomin",  // 03 eruru reward 1
  "panR",    // 04 eruru reward 2  (motion path)
  "drift",   // 05 miu profile
  "zoomin",  // 06 miu reward 1
  "panL",    // 07 miu reward 2
  "drift",   // 08 ririka profile
  "zoomin",  // 09 ririka reward 1
  "panR",    // 10 ririka reward 2
  "zoomin",  // 11 title ensemble (push toward the trio)
  "zoomout", // 12 school + trio  (pull back)
  "zoomin",  // 13 title logo (end)
];
// reward<->reward switches use a plain fade; others vary gently.
const transitions = [
  "fade",      // 01->02 logo -> eruru
  "dissolve",  // 02->03 profile -> reward
  "fade",      // 03->04 reward -> reward
  "fadewhite", // 04->05 eruru -> miu
  "dissolve",  // 05->06 profile -> reward
  "fade",      // 06->07 reward -> reward
  "fadewhite", // 07->08 miu -> ririka
  "dissolve",  // 08->09 profile -> reward
  "fade",      // 09->10 reward -> reward
  "fadewhite", // 10->11 ririka -> ensemble
  "dissolve",  // 11->12 ensemble -> school
  "fade",      // 12->13 school -> logo
];
const N = durations.length;
const song = path.join(here, "..", "assets", "characters", "三色チェックメイト！～しょうぎむすめOP主題歌～.mp3");

// Build the per-scene filter. SS=3x supersample kills zoompan jitter; motion is
// kept gentle so the per-frame displacement stays tiny.
function sceneVf(motion, DF) {
  const base = `scale=5760:3240:flags=lanczos,setsar=1,`;
  const tail = `:d=${DF}:s=1920x1080:fps=${FPS},format=yuv420p`;
  const cx = `iw/2-(iw/zoom/2)`;
  const cy = `ih/2-(ih/zoom/2)`;
  const p = `(on/(${DF}-1))`;      // progress 0..1
  const s = `(2*on/(${DF}-1)-1)`;  // signed progress -1..1
  switch (motion) {
    case "zoomin":
      return base + `zoompan=z='1+0.09*${p}':x='${cx}':y='${cy}'` + tail;
    case "zoomout":
      return base + `zoompan=z='1.09-0.09*${p}':x='${cx}':y='${cy}'` + tail;
    case "drift": // gentle push-in + diagonal drift (character "motion path")
      return base + `zoompan=z='1.04+0.04*${p}':x='${cx}+90*${s}':y='${cy}+50*${s}'` + tail;
    case "panR": // gentle push-in + pan left -> right (zoom keeps every frame moving)
      return base + `zoompan=z='1.03+0.05*${p}':x='(iw-iw/zoom)*${p}':y='${cy}'` + tail;
    case "panL": // gentle push-in + pan right -> left
      return base + `zoompan=z='1.03+0.05*${p}':x='(iw-iw/zoom)*(1-${p})':y='${cy}'` + tail;
    default:
      return base + `zoompan=z='1':x='${cx}':y='${cy}'` + tail;
  }
}

function run(args, label) {
  const res = spawnSync(ffmpeg, args, { stdio: ["ignore", "pipe", "pipe"] });
  if (res.status !== 0) {
    console.error(`FAILED: ${label}`);
    console.error(res.stderr.toString().split("\n").slice(-12).join("\n"));
    process.exit(1);
  }
}

// ---- Stage 1: per-scene clips with gentle motion ----
for (let i = 0; i < N; i++) {
  const src = path.join(here, "frames", `f${String(i + 1).padStart(2, "0")}.png`);
  const dst = path.join(clipsDir, `c${String(i + 1).padStart(2, "0")}.mp4`);
  const DF = Math.round(durations[i] * FPS);
  if (fs.existsSync(dst) && fs.statSync(dst).size > 0) {
    console.log("clip", i + 1, "skip (exists)");
    continue;
  }
  // single (non-looped) image: zoompan d=DF sets the TOTAL output frame count.
  run(
    [
      "-y", "-i", src, "-vf", sceneVf(motions[i], DF), "-frames:v", String(DF),
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p",
      "-r", String(FPS), dst,
    ],
    `scene ${i + 1} (${motions[i]})`
  );
  console.log("clip", i + 1, motions[i], "ok");
}

// ---- Stage 2: crossfade chain + audio ----
const inputs = [];
for (let i = 0; i < N; i++) inputs.push("-i", path.join(clipsDir, `c${String(i + 1).padStart(2, "0")}.mp4`));
inputs.push("-i", song);

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
    "-c:v", "libx264", "-preset", "medium", "-crf", "22",
    "-pix_fmt", "yuv420p", "-r", String(FPS),
    "-c:a", "aac", "-b:a", "192k", "-t", total,
    "-movflags", "+faststart", out,
  ],
  { stdio: ["ignore", "pipe", "pipe"] }
);
if (res.status !== 0) {
  console.error("FAILED: stage 2");
  console.error(res.stderr.toString().split("\n").slice(-15).join("\n"));
}
console.log("done:", out);
process.exit(res.status ?? 1);
