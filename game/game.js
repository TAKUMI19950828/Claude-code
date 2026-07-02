/* ============================================================
   将棋娘だいぼうけん！
   かわいいマリオ風2Dプラットフォーマー
   ============================================================ */
(() => {
  "use strict";

  // ---------- 定数 ----------
  const TILE = 48;
  const VIEW_W = 960;
  const VIEW_H = 540;
  const GRAVITY = 0.6;
  const MAX_FALL = 16;

  // キャラクター定義（性能差あり）
  const CHARACTERS = {
    eruru: {
      name: "エルル",
      img: "../assets/characters/eruru-full.webp",
      speed: 4.3, jump: 13.8,
      theme: "sakura",
      stageName: "🌸 さくらの丘",
      hud: "🌸 エルル",
    },
    miu: {
      name: "ミウ",
      img: "../assets/characters/miu-full.webp",
      speed: 5.3, jump: 13.0,
      theme: "sea",
      stageName: "🫧 うみかぜ海岸",
      hud: "🫧 ミウ",
    },
    ririka: {
      name: "リリカ",
      img: "../assets/characters/ririka-full.webp",
      speed: 4.1, jump: 15.4,
      theme: "night",
      stageName: "🌙 ほしぞら回廊",
      hud: "🌙 リリカ",
    },
  };

  // テーマカラー
  const THEMES = {
    sakura: {
      skyTop: "#ffe9f2", skyBottom: "#fff6ea",
      hillFar: "#ffd3e4", hillNear: "#ffb9d4",
      ground: "#e98fb4", groundDark: "#d1739c", grass: "#ffd1e3",
      brick: "#f5b0cb", brickLine: "#e18bae",
      accent: "#ec6d9e",
      particle: "petal",
    },
    sea: {
      skyTop: "#dff6ff", skyBottom: "#f2fffb",
      hillFar: "#bfe9ef", hillNear: "#96dbe4",
      ground: "#5fc4ba", groundDark: "#48a89f", grass: "#a9ecdf",
      brick: "#8fd7dc", brickLine: "#63b9c0",
      accent: "#2ba6a0",
      particle: "bubble",
    },
    night: {
      skyTop: "#c9b3ec", skyBottom: "#efe6ff",
      hillFar: "#b195e0", hillNear: "#9a7bd1",
      ground: "#8f6cc9", groundDark: "#7657ad", grass: "#cdb4f2",
      brick: "#ab8ede", brickLine: "#8a68c2",
      accent: "#6f4bb8",
      particle: "star",
    },
  };

  // ---------- ステージマップ ----------
  // # 地面 / B レンガ / ? ハテナブロック / - 浮き足場
  // o ハート / e 敵（歩の駒） / F ゴール / P スタート
  const STAGES = {
    sakura: [
      "................................................................................................................................",
      "................................................................................................................................",
      "................................................................................................................................",
      "......................o.................o..o..............................o.o.o.................................................",
      "....................B?B?B..............----..............BBBB.............-----......o.o..........................o.............",
      "...............................................o.o.................?..............................B?B............---............",
      "..........o.o............................................--------.........................o.o.....................F.............",
      ".........-----..............o...-...........................................-...--......------.........e.........#..............",
      "....................??.....---......--..............e...........e.....................................####.......##.............",
      "..............................................##..........................................e.....----............###.............",
      "..P.................e.....................o..###...............................e.......######..........########.####............",
      "#############...#######..######..####....############...#################...##############..............#####################...",
      "#############...#######..######..####....############...#################...##############..............#####################...",
      "#############...#######..######..####....############...#################...##############..............#####################...",
      "#############...#######..######..####....############...#################...##############..............#####################...",
    ],
    sea: [
      "................................................................................................................................",
      "................................................................................................................................",
      "..........................o.o.o.................................................................................................",
      ".........................-------...............o...o...............oo...........o.o.o...........................................",
      "..................o.................B?B.......--...--.............----........--------...........o.o............................",
      ".................---.........................................o..............................B?B?B?B.............o...............",
      "........o.................-...........o..o.................----.....................e..........................---..F...........",
      ".......---.......e.......---.........------.........o..............-...-...-.....#####..........e...................#...........",
      "...............#####.............e................ ---............................................####..........o..##...........",
      "..........................o....####......e..............e.e...---.....................o.o...................------.###..........",
      "..P....................e..................########....######......e.e.....e.........#####...e.e.......e............####.........",
      "###############...########..#####....#####........................######..######............####..########....#################.",
      "###############...########..#####....#####........................######..######............####..########....#################.",
      "###############...########..#####....#####........................######..######............####..########....#################.",
      "###############...########..#####....#####........................######..######............####..########....#################.",
    ],
    night: [
      "................................................................................................................................",
      "..........................................o..o..................................................................................",
      ".........................................------..........o.o.o...........................o..o...................................",
      "..............o.o.........o.............................-------..........B?B...........-------..................................",
      ".............-----.......---......o..............................................o.................o.o.o........................",
      ".....................................-....?...........o.................---......-.....e..........-------.........o.............",
      "........o.........................................o..---.....o.o................................................----.F..........",
      ".......---........e...........o.o.........-...-.....................--......e.........####...........e...............#..........",
      "..............B?B?B..........-----.................o...............................................######..........o.##.........",
      "..................................................---.....e.e..........o.o.....................................----.###.........",
      "..P.................e.e.....................e...........#######......--------.......e.e......e.e...................#####........",
      "############...#########..#######....##########....................................######...######....######...################.",
      "############...#########..#######....##########....................................######...######....######...################.",
      "############...#########..#######....##########....................................######...######....######...################.",
      "############...#########..#######....##########....................................######...######....######...################.",
    ],
  };

  // ---------- DOM ----------
  const $ = (sel) => document.querySelector(sel);
  const screenSelect = $("#screen-select");
  const screenGame = $("#screen-game");
  const canvas = $("#game-canvas");
  const ctx = canvas.getContext("2d");
  const hudChar = $("#hud-char");
  const hudHearts = $("#hud-hearts");
  const hudLives = $("#hud-lives");
  const hudStage = $("#hud-stage");
  const overlay = $("#overlay");
  const overlayTitle = $("#overlay-title");
  const overlayText = $("#overlay-text");

  // ---------- サウンド（WebAudio でシンプルなピコピコ音） ----------
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { audioCtx = null; }
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  }
  function beep(freq, dur, type = "square", vol = 0.08, slideTo = null) {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }
  const SFX = {
    jump()  { beep(420, 0.18, "square", 0.06, 780); },
    heart() { beep(880, 0.09, "square", 0.07); setTimeout(() => beep(1320, 0.14, "square", 0.07), 70); },
    stomp() { beep(300, 0.12, "triangle", 0.1, 120); },
    hurt()  { beep(220, 0.3, "sawtooth", 0.07, 90); },
    block() { beep(660, 0.08, "square", 0.06); },
    clear() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.22, "square", 0.07), i * 130)); },
    over()  { [392, 330, 262, 196].forEach((f, i) => setTimeout(() => beep(f, 0.3, "triangle", 0.08), i * 200)); },
  };

  // ---------- 入力 ----------
  const keys = { left: false, right: false, jump: false };
  let jumpBuffered = false;

  window.addEventListener("keydown", (e) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", " ", "Space"].includes(e.key) || e.code === "Space") e.preventDefault();
    ensureAudio();
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = true;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = true;
    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.code === "Space") {
      if (!keys.jump) jumpBuffered = true;
      keys.jump = true;
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = false;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = false;
    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.code === "Space") keys.jump = false;
  });

  // タッチ操作
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    document.body.classList.add("touch");
  }
  function bindTouch(id, prop) {
    const el = $(id);
    const on = (e) => { e.preventDefault(); ensureAudio(); if (prop === "jump" && !keys.jump) jumpBuffered = true; keys[prop] = true; };
    const off = (e) => { e.preventDefault(); keys[prop] = false; };
    el.addEventListener("touchstart", on, { passive: false });
    el.addEventListener("touchend", off, { passive: false });
    el.addEventListener("touchcancel", off, { passive: false });
    el.addEventListener("mousedown", on);
    el.addEventListener("mouseup", off);
    el.addEventListener("mouseleave", off);
  }
  bindTouch("#btn-left", "left");
  bindTouch("#btn-right", "right");
  bindTouch("#btn-jump", "jump");

  // ---------- ゲーム状態 ----------
  const game = {
    running: false,
    charId: null,
    char: null,
    theme: null,
    grid: [],            // タイルコードの2次元配列
    rows: 0, cols: 0,
    worldW: 0, worldH: 0,
    spawn: { x: 0, y: 0 },
    goal: { x: 0, y: 0 },
    enemies: [],
    hearts: [],
    qblocks: new Map(),  // "col,row" -> { bounce, used }
    particles: [],
    deco: [],            // 背景の浮遊装飾（花びら・泡・星）
    camX: 0, camY: 0,
    heartsGot: 0,
    lives: 3,
    time: 0,
    state: "play",       // play / clearing / dead / over
    stateTimer: 0,
    playerImg: null,
  };

  const player = {
    x: 0, y: 0, w: 30, h: 70,
    vx: 0, vy: 0,
    facing: 1,
    onGround: false,
    coyote: 0,
    invincible: 0,
    squash: 1,           // 着地・ジャンプの伸び縮み演出
    runPhase: 0,
  };

  const imageCache = {};
  function loadImage(src) {
    if (imageCache[src]) return imageCache[src];
    const img = new Image();
    img.src = src;
    imageCache[src] = img;
    return img;
  }

  // ---------- ステージ読み込み ----------
  function loadStage(charId) {
    const char = CHARACTERS[charId];
    game.charId = charId;
    game.char = char;
    game.theme = THEMES[char.theme];
    game.playerImg = loadImage(char.img);

    // 行の長さをそろえる（短い行は右端を空白タイルで埋める）
    const raw = STAGES[char.theme];
    const maxCols = Math.max(...raw.map((r) => r.length));
    const map = raw.map((r) => r.padEnd(maxCols, "."));
    game.rows = map.length;
    game.cols = maxCols;
    game.worldW = game.cols * TILE;
    game.worldH = game.rows * TILE;
    game.grid = [];
    game.enemies = [];
    game.hearts = [];
    game.qblocks = new Map();
    game.particles = [];
    game.heartsGot = 0;
    game.time = 0;
    game.state = "play";

    for (let r = 0; r < game.rows; r++) {
      const row = [];
      for (let c = 0; c < game.cols; c++) {
        const ch = map[r][c] || ".";
        switch (ch) {
          case "#": case "B": case "-":
            row.push(ch);
            break;
          case "?":
            row.push("?");
            game.qblocks.set(`${c},${r}`, { bounce: 0, used: false });
            break;
          case "P":
            game.spawn = { x: c * TILE + 9, y: r * TILE + TILE - player.h };
            row.push(".");
            break;
          case "F":
            game.goal = { x: c * TILE + TILE / 2, y: r * TILE };
            row.push(".");
            break;
          case "o":
            game.hearts.push({ x: c * TILE + TILE / 2, y: r * TILE + TILE / 2, taken: false, phase: Math.random() * 6.28 });
            row.push(".");
            break;
          case "e":
            game.enemies.push({
              x: c * TILE + 4, y: r * TILE + TILE - 40,
              w: 40, h: 40, vx: -1.0, alive: true, squashT: 0, phase: Math.random() * 6.28,
            });
            row.push(".");
            break;
          default:
            row.push(".");
        }
      }
      game.grid.push(row);
    }

    // 背景装飾を散らす
    game.deco = [];
    for (let i = 0; i < 40; i++) {
      game.deco.push({
        x: Math.random() * game.worldW,
        y: Math.random() * VIEW_H,
        size: 4 + Math.random() * 8,
        speed: 0.2 + Math.random() * 0.6,
        drift: Math.random() * 6.28,
      });
    }

    respawn();
    hudChar.textContent = char.hud;
    hudStage.textContent = char.stageName;
    updateHud();
  }

  function respawn() {
    player.x = game.spawn.x;
    player.y = game.spawn.y;
    player.vx = 0;
    player.vy = 0;
    player.facing = 1;
    player.onGround = false;
    player.invincible = 90;
    game.camX = Math.max(0, player.x - VIEW_W / 3);
  }

  function updateHud() {
    hudHearts.textContent = `💗 × ${game.heartsGot}`;
    hudLives.textContent = `👧 × ${game.lives}`;
  }

  // ---------- タイル判定 ----------
  function tileAt(px, py) {
    const c = Math.floor(px / TILE);
    const r = Math.floor(py / TILE);
    if (c < 0 || c >= game.cols) return "#"; // 左右端は壁扱い
    if (r < 0 || r >= game.rows) return ".";
    return game.grid[r][c];
  }
  function isSolid(ch) {
    return ch === "#" || ch === "B" || ch === "?" || ch === "-" || ch === "U";
  }
  function solidAt(px, py) { return isSolid(tileAt(px, py)); }

  // AABBをグリッドに対して移動・解決する（共通処理）
  function moveBody(body, hitCeil) {
    // X方向
    body.x += body.vx;
    if (body.vx > 0) {
      if (solidAt(body.x + body.w, body.y + 2) || solidAt(body.x + body.w, body.y + body.h / 2) || solidAt(body.x + body.w, body.y + body.h - 2)) {
        body.x = Math.floor((body.x + body.w) / TILE) * TILE - body.w - 0.01;
        body.vx = 0;
        body.hitWall = 1;
      }
    } else if (body.vx < 0) {
      if (solidAt(body.x, body.y + 2) || solidAt(body.x, body.y + body.h / 2) || solidAt(body.x, body.y + body.h - 2)) {
        body.x = (Math.floor(body.x / TILE) + 1) * TILE + 0.01;
        body.vx = 0;
        body.hitWall = -1;
      }
    }
    // Y方向
    body.y += body.vy;
    body.grounded = false;
    if (body.vy > 0) {
      if (solidAt(body.x + 3, body.y + body.h) || solidAt(body.x + body.w - 3, body.y + body.h)) {
        body.y = Math.floor((body.y + body.h) / TILE) * TILE - body.h - 0.01;
        body.vy = 0;
        body.grounded = true;
      }
    } else if (body.vy < 0) {
      if (solidAt(body.x + 3, body.y) || solidAt(body.x + body.w - 3, body.y)) {
        const r = Math.floor(body.y / TILE);
        body.y = (r + 1) * TILE + 0.01;
        body.vy = 0;
        if (hitCeil) hitCeil(Math.floor((body.x + body.w / 2) / TILE), r);
      }
    }
  }

  // ---------- パーティクル ----------
  function burst(x, y, color, n = 10, type = "spark") {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.28;
      const sp = 1.5 + Math.random() * 3;
      game.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 2,
        life: 30 + Math.random() * 25,
        maxLife: 55,
        size: 3 + Math.random() * 5,
        color, type,
        spin: Math.random() * 6.28,
      });
    }
  }

  // ---------- 更新処理 ----------
  function hitQuestionBlock(c, r) {
    const key = `${c},${r}`;
    const ch = tileAt(c * TILE + 1, r * TILE + 1);
    if (ch === "?") {
      const q = game.qblocks.get(key);
      if (q && !q.used) {
        q.used = true;
        q.bounce = 10;
        game.grid[r][c] = "U";
        game.heartsGot++;
        updateHud();
        SFX.heart();
        burst(c * TILE + TILE / 2, r * TILE - 6, "#ff6da3", 12, "heart");
      } else {
        SFX.block();
      }
    } else if (ch === "B") {
      SFX.block();
      burst(c * TILE + TILE / 2, r * TILE + TILE / 2, game.theme.brick, 6, "spark");
    }
  }

  function damagePlayer() {
    if (player.invincible > 0) return;
    SFX.hurt();
    game.lives--;
    updateHud();
    burst(player.x + player.w / 2, player.y + player.h / 2, "#ff6da3", 14, "heart");
    if (game.lives <= 0) {
      game.state = "over";
      game.stateTimer = 40;
      SFX.over();
      return;
    }
    player.invincible = 120;
    player.vy = -9;
    player.vx = -player.facing * 5;
  }

  function loseLifeByFall() {
    SFX.hurt();
    game.lives--;
    updateHud();
    if (game.lives <= 0) {
      game.state = "over";
      game.stateTimer = 40;
      SFX.over();
    } else {
      respawn();
    }
  }

  function update() {
    game.time++;
    const th = game.theme;

    if (game.state === "clearing") {
      game.stateTimer--;
      player.squash = 1 + Math.sin(game.time * 0.4) * 0.08;
      if (game.stateTimer <= 0) showClear();
      updateParticles();
      return;
    }
    if (game.state === "over") {
      game.stateTimer--;
      if (game.stateTimer <= 0) showGameOver();
      updateParticles();
      return;
    }

    // --- プレイヤー操作 ---
    const accel = player.onGround ? 0.7 : 0.45;
    const maxSpd = game.char.speed;
    if (keys.left)  { player.vx -= accel; player.facing = -1; }
    if (keys.right) { player.vx += accel; player.facing = 1; }
    if (!keys.left && !keys.right) player.vx *= player.onGround ? 0.78 : 0.92;
    player.vx = Math.max(-maxSpd, Math.min(maxSpd, player.vx));
    if (Math.abs(player.vx) < 0.05) player.vx = 0;

    if (player.onGround) player.coyote = 7;
    else if (player.coyote > 0) player.coyote--;

    if (jumpBuffered && player.coyote > 0) {
      player.vy = -game.char.jump;
      player.coyote = 0;
      player.squash = 0.7;
      SFX.jump();
      burst(player.x + player.w / 2, player.y + player.h, "#ffffff", 5, "spark");
    }
    jumpBuffered = false;

    // 可変ジャンプ（ボタンを離すと上昇が弱まる）
    if (!keys.jump && player.vy < -4) player.vy = -4;

    player.vy = Math.min(player.vy + GRAVITY, MAX_FALL);

    const wasOnGround = player.onGround;
    moveBody(player, hitQuestionBlock);
    player.onGround = player.grounded;
    if (player.onGround && !wasOnGround) {
      player.squash = 1.25;
      if (player.vyBeforeLand > 10) burst(player.x + player.w / 2, player.y + player.h, "#ffffff", 6, "spark");
    }
    player.vyBeforeLand = player.vy;
    player.squash += (1 - player.squash) * 0.15;
    if (player.onGround && Math.abs(player.vx) > 0.5) player.runPhase += Math.abs(player.vx) * 0.05;
    if (player.invincible > 0) player.invincible--;

    // 穴に落ちた
    if (player.y > game.worldH + 100) { loseLifeByFall(); return; }

    // --- 敵 ---
    for (const en of game.enemies) {
      if (!en.alive) { en.squashT--; continue; }
      en.phase += 0.15;
      en.vy = (en.vy || 0) + GRAVITY;
      en.vy = Math.min(en.vy, MAX_FALL);
      en.hitWall = 0;
      moveBody(en);
      if (en.hitWall) en.vx = en.hitWall > 0 ? -Math.abs(en.vx || 1) : Math.abs(en.vx || 1);
      // 崖で引き返す
      if (en.grounded) {
        const aheadX = en.vx > 0 ? en.x + en.w + 2 : en.x - 2;
        if (!solidAt(aheadX, en.y + en.h + 4)) en.vx = -en.vx;
      }
      if (en.y > game.worldH + 100) { en.alive = false; en.squashT = 0; continue; }

      // プレイヤーとの当たり判定
      if (rectHit(player, en)) {
        const playerBottom = player.y + player.h;
        if (player.vy > 0 && playerBottom - en.y < 26) {
          // 踏みつけ！
          en.alive = false;
          en.squashT = 25;
          player.vy = -8.5;
          SFX.stomp();
          burst(en.x + en.w / 2, en.y + en.h / 2, "#d9a05b", 10, "spark");
        } else {
          damagePlayer();
        }
      }
    }

    // --- ハート ---
    for (const ht of game.hearts) {
      if (ht.taken) continue;
      ht.phase += 0.08;
      const hx = ht.x - 14, hy = ht.y - 14 + Math.sin(ht.phase) * 5;
      if (rectHit(player, { x: hx, y: hy, w: 28, h: 28 })) {
        ht.taken = true;
        game.heartsGot++;
        updateHud();
        SFX.heart();
        burst(ht.x, ht.y, "#ff6da3", 8, "heart");
      }
    }

    // --- ？ブロックのバウンド演出 ---
    for (const q of game.qblocks.values()) {
      if (q.bounce > 0) q.bounce--;
    }

    // --- ゴール判定 ---
    if (Math.abs(player.x + player.w / 2 - game.goal.x) < 26 && player.y + player.h > game.goal.y - TILE * 3) {
      game.state = "clearing";
      game.stateTimer = 90;
      SFX.clear();
      for (let i = 0; i < 4; i++) {
        setTimeout(() => burst(game.goal.x, game.goal.y + TILE * (1 + i % 3), "#ffd66e", 12, "heart"), i * 150);
      }
    }

    updateParticles();

    // --- カメラ ---
    const targetX = player.x + player.w / 2 - VIEW_W * 0.42;
    game.camX += (targetX - game.camX) * 0.12;
    game.camX = Math.max(0, Math.min(game.camX, game.worldW - VIEW_W));
    const targetY = player.y + player.h / 2 - VIEW_H * 0.55;
    game.camY += (targetY - game.camY) * 0.1;
    game.camY = Math.max(-TILE * 2, Math.min(game.camY, game.worldH - VIEW_H));
  }

  function updateParticles() {
    for (let i = game.particles.length - 1; i >= 0; i--) {
      const p = game.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.spin += 0.1;
      p.life--;
      if (p.life <= 0) game.particles.splice(i, 1);
    }
  }

  function rectHit(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // ---------- 描画 ----------
  function draw() {
    const th = game.theme;
    const camX = game.camX, camY = game.camY;

    // 空
    const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    sky.addColorStop(0, th.skyTop);
    sky.addColorStop(1, th.skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    drawBackdrop(th, camX);

    ctx.save();
    ctx.translate(-Math.round(camX), -Math.round(camY));

    drawTiles(th, camX, camY);
    drawGoal(th);
    drawHearts();
    drawEnemies();
    drawPlayer();
    drawParticles();

    ctx.restore();
  }

  // 遠景（テーマごとの飾り＋パララックス丘）
  function drawBackdrop(th, camX) {
    // 月（夜テーマのみ）
    if (game.char.theme === "night") {
      ctx.fillStyle = "rgba(255, 236, 170, .9)";
      ctx.beginPath();
      ctx.arc(VIEW_W - 140, 100, 46, 0, 6.28);
      ctx.fill();
      ctx.fillStyle = th.skyTop;
      ctx.beginPath();
      ctx.arc(VIEW_W - 122, 88, 40, 0, 6.28);
      ctx.fill();
    }
    // 丘 2層
    for (const [color, para, base, amp] of [[th.hillFar, 0.2, 430, 60], [th.hillNear, 0.4, 480, 45]]) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, VIEW_H);
      for (let x = 0; x <= VIEW_W; x += 16) {
        const wx = (x + camX * para) * 0.006;
        ctx.lineTo(x, base - Math.abs(Math.sin(wx)) * amp);
      }
      ctx.lineTo(VIEW_W, VIEW_H);
      ctx.closePath();
      ctx.fill();
    }
    // 浮遊装飾（花びら・泡・星）
    for (const d of game.deco) {
      const sx = ((d.x - camX * 0.5) % (VIEW_W + 60) + VIEW_W + 60) % (VIEW_W + 60) - 30;
      const sy = (d.y + game.time * d.speed * (game.char.theme === "sea" ? -1 : 1) % VIEW_H + VIEW_H) % VIEW_H;
      const wob = Math.sin(game.time * 0.02 + d.drift) * 10;
      ctx.save();
      ctx.translate(sx + wob, sy);
      ctx.globalAlpha = 0.5;
      if (th.particle === "petal") {
        ctx.rotate(d.drift + game.time * 0.01);
        ctx.fillStyle = "#ffb9d4";
        ctx.beginPath();
        ctx.ellipse(0, 0, d.size, d.size * 0.6, 0, 0, 6.28);
        ctx.fill();
      } else if (th.particle === "bubble") {
        ctx.strokeStyle = "#8fd7dc";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, d.size, 0, 6.28);
        ctx.stroke();
      } else {
        drawStar(0, 0, d.size * 0.7, "#ffe9a8");
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawStar(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? r : r * 0.45;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawTiles(th, camX, camY) {
    const c0 = Math.max(0, Math.floor(camX / TILE) - 1);
    const c1 = Math.min(game.cols - 1, Math.ceil((camX + VIEW_W) / TILE) + 1);
    const r0 = Math.max(0, Math.floor(camY / TILE) - 1);
    const r1 = Math.min(game.rows - 1, Math.ceil((camY + VIEW_H) / TILE) + 1);

    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const ch = game.grid[r][c];
        if (ch === ".") continue;
        const x = c * TILE, y = r * TILE;

        if (ch === "#") {
          ctx.fillStyle = th.ground;
          ctx.fillRect(x, y, TILE, TILE);
          // 上が空いていれば芝生
          if (r === 0 || game.grid[r - 1][c] === "." ) {
            ctx.fillStyle = th.grass;
            ctx.fillRect(x, y, TILE, 12);
            ctx.beginPath();
            for (let i = 0; i < 4; i++) ctx.arc(x + 6 + i * 12, y + 12, 6, 0, Math.PI);
            ctx.fill();
          }
          ctx.fillStyle = th.groundDark;
          ctx.fillRect(x + 8, y + 24, 8, 6);
          ctx.fillRect(x + 30, y + 34, 8, 6);
        } else if (ch === "B") {
          drawRoundedBlock(x, y, th.brick, th.brickLine);
          ctx.strokeStyle = th.brickLine;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x + 4, y + TILE / 2); ctx.lineTo(x + TILE - 4, y + TILE / 2);
          ctx.moveTo(x + TILE / 2, y + 4); ctx.lineTo(x + TILE / 2, y + TILE / 2);
          ctx.stroke();
        } else if (ch === "?" || ch === "U") {
          const q = game.qblocks.get(`${c},${r}`);
          const by = y - (q && q.bounce > 0 ? Math.sin((q.bounce / 10) * Math.PI) * 10 : 0);
          drawRoundedBlock(x, by, ch === "?" ? "#ffd66e" : "#d9c9b8", ch === "?" ? "#e8a93e" : "#b8a794");
          ctx.fillStyle = ch === "?" ? "#a9691c" : "#8a7a68";
          ctx.font = "bold 26px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(ch === "?" ? "?" : "♪", x + TILE / 2, by + TILE / 2 + 2);
        } else if (ch === "-") {
          // 浮き足場（雲みたいなかわいい足場）
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = th.brickLine;
          ctx.lineWidth = 2;
          roundRect(x + 1, y + 6, TILE - 2, TILE - 18, 12);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = th.grass;
          roundRect(x + 5, y + 10, TILE - 10, 8, 4);
          ctx.fill();
        }
      }
    }
  }

  function drawRoundedBlock(x, y, fill, line) {
    ctx.fillStyle = fill;
    ctx.strokeStyle = line;
    ctx.lineWidth = 2.5;
    roundRect(x + 1.5, y + 1.5, TILE - 3, TILE - 3, 8);
    ctx.fill();
    ctx.stroke();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawGoal(th) {
    const gx = game.goal.x, gy = game.goal.y;
    const poleTop = gy - TILE * 4;
    // ポール
    ctx.fillStyle = "#c9a56a";
    ctx.fillRect(gx - 4, poleTop, 8, TILE * 5);
    ctx.fillStyle = "#ffd66e";
    ctx.beginPath();
    ctx.arc(gx, poleTop, 10, 0, 6.28);
    ctx.fill();
    // 旗（ひらひら）
    const wave = Math.sin(game.time * 0.08) * 6;
    ctx.fillStyle = th.accent;
    ctx.beginPath();
    ctx.moveTo(gx + 4, poleTop + 6);
    ctx.quadraticCurveTo(gx + 40, poleTop + 14 + wave, gx + 64, poleTop + 22 + wave);
    ctx.quadraticCurveTo(gx + 40, poleTop + 30 + wave * 0.5, gx + 4, poleTop + 44);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 17px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.save();
    ctx.translate(gx + 28, poleTop + 25 + wave * 0.6);
    ctx.fillText("👑", 0, 0);
    ctx.restore();
  }

  function drawHearts() {
    for (const ht of game.hearts) {
      if (ht.taken) continue;
      const y = ht.y + Math.sin(ht.phase) * 5;
      drawHeartShape(ht.x, y, 12, "#ff6da3", "#ffffff");
    }
  }

  function drawHeartShape(x, y, size, color, hl) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.35);
    ctx.bezierCurveTo(-size, -size * 0.55, -size * 0.5, -size * 1.1, 0, -size * 0.35);
    ctx.bezierCurveTo(size * 0.5, -size * 1.1, size, -size * 0.55, 0, size * 0.35);
    ctx.lineTo(0, size);
    ctx.closePath();
    ctx.fill();
    // ハイライト
    if (hl) {
      ctx.fillStyle = hl;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(-size * 0.35, -size * 0.45, size * 0.18, 0, 6.28);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  // 敵：とことこ歩く将棋の駒「歩」
  function drawEnemies() {
    for (const en of game.enemies) {
      if (!en.alive && en.squashT <= 0) continue;
      const cx = en.x + en.w / 2;
      const squash = en.alive ? 1 : Math.max(0.15, en.squashT / 25 * 0.5);
      const bob = en.alive ? Math.sin(en.phase) * 2 : 0;
      const bottom = en.y + en.h;

      ctx.save();
      ctx.translate(cx, bottom);
      ctx.scale(1, squash);
      ctx.translate(0, bob);

      // 将棋の駒（五角形）
      const w = 20, h = 38;
      const grad = ctx.createLinearGradient(0, -h, 0, 0);
      grad.addColorStop(0, "#f0cf96");
      grad.addColorStop(1, "#d9a05b");
      ctx.fillStyle = grad;
      ctx.strokeStyle = "#a8743a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -h);
      ctx.lineTo(w * 0.75, -h * 0.68);
      ctx.lineTo(w, 0);
      ctx.lineTo(-w, 0);
      ctx.lineTo(-w * 0.75, -h * 0.68);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 「歩」の文字とお顔
      ctx.fillStyle = "#6b4423";
      ctx.font = "bold 15px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("歩", 0, -h * 0.62);
      if (en.alive) {
        // 目
        ctx.fillStyle = "#4a3220";
        ctx.beginPath();
        ctx.arc(-7, -h * 0.3, 2.6, 0, 6.28);
        ctx.arc(7, -h * 0.3, 2.6, 0, 6.28);
        ctx.fill();
        // ほっぺ
        ctx.fillStyle = "rgba(255, 130, 150, .55)";
        ctx.beginPath();
        ctx.arc(-12, -h * 0.2, 3.2, 0, 6.28);
        ctx.arc(12, -h * 0.2, 3.2, 0, 6.28);
        ctx.fill();
        // 口
        ctx.strokeStyle = "#4a3220";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -h * 0.24, 4, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        // あんよ
        ctx.fillStyle = "#a8743a";
        const step = Math.sin(en.phase * 2) * 4;
        ctx.beginPath();
        ctx.ellipse(-9 + step, 1, 6, 4, 0, 0, 6.28);
        ctx.ellipse(9 - step, 1, 6, 4, 0, 0, 6.28);
        ctx.fill();
      } else {
        // やられ顔
        ctx.strokeStyle = "#4a3220";
        ctx.lineWidth = 2;
        for (const ex of [-7, 7]) {
          ctx.beginPath();
          ctx.moveTo(ex - 3, -h * 0.34); ctx.lineTo(ex + 3, -h * 0.26);
          ctx.moveTo(ex + 3, -h * 0.34); ctx.lineTo(ex - 3, -h * 0.26);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  function drawPlayer() {
    const img = game.playerImg;
    // 無敵中は点滅
    if (player.invincible > 0 && Math.floor(game.time / 4) % 2 === 0) return;

    const cx = player.x + player.w / 2;
    const bottom = player.y + player.h;
    const lean = player.onGround ? Math.sin(player.runPhase) * 0.06 * Math.sign(player.vx || 0) : (player.vy < 0 ? -0.06 : 0.05) * player.facing;

    ctx.save();
    ctx.translate(cx, bottom);
    ctx.scale(player.facing, 1);
    ctx.rotate(lean * player.facing);
    ctx.scale(1 / player.squash ** 0.5, player.squash);

    if (img && img.complete && img.naturalWidth > 0) {
      const drawH = 88;
      const drawW = drawH * (img.naturalWidth / img.naturalHeight);
      const hop = player.onGround && Math.abs(player.vx) > 0.5 ? Math.abs(Math.sin(player.runPhase)) * -5 : 0;
      ctx.drawImage(img, -drawW / 2, -drawH + hop, drawW, drawH);
    } else {
      // 画像読み込み前のフォールバック
      ctx.fillStyle = game.theme.accent;
      roundRect(-15, -70, 30, 70, 12);
      ctx.fill();
    }
    ctx.restore();

    // ふんわり影
    ctx.fillStyle = "rgba(91, 74, 85, .18)";
    ctx.beginPath();
    ctx.ellipse(cx, bottom + 3, 18 * player.squash ** 0.5, 5, 0, 0, 6.28);
    ctx.fill();
  }

  function drawParticles() {
    for (const p of game.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      if (p.type === "heart") {
        drawHeartShape(p.x, p.y, p.size * 0.8, p.color, null);
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  }

  // ---------- 画面遷移 ----------
  function showClear() {
    game.state = "cleared";
    overlayTitle.textContent = "🎉 ステージクリア！ 🎉";
    overlayText.textContent = `${game.char.name}「やったね♪ ありがとう！」\n💗 あつめたハート：${game.heartsGot}こ`;
    overlay.classList.remove("hidden");
  }

  function showGameOver() {
    overlayTitle.textContent = "げーむおーばー…";
    overlayText.textContent = `${game.char.name}「つぎはきっとだいじょうぶ！」\n💗 あつめたハート：${game.heartsGot}こ`;
    overlay.classList.remove("hidden");
  }

  function startGame(charId) {
    ensureAudio();
    overlay.classList.add("hidden");
    screenSelect.classList.remove("active");
    screenGame.classList.add("active");
    game.lives = 3;
    loadStage(charId);
    game.running = true;
  }

  function backToSelect() {
    game.running = false;
    overlay.classList.add("hidden");
    screenGame.classList.remove("active");
    screenSelect.classList.add("active");
  }

  document.querySelectorAll(".char-card").forEach((card) => {
    card.addEventListener("click", () => startGame(card.dataset.char));
  });
  $("#btn-retry").addEventListener("click", () => {
    overlay.classList.add("hidden");
    game.lives = 3;
    loadStage(game.charId);
  });
  $("#btn-select").addEventListener("click", backToSelect);

  // 画像は先に読み込みを開始しておく
  Object.values(CHARACTERS).forEach((c) => loadImage(c.img));

  // ---------- メインループ（60fps固定ステップ） ----------
  let last = performance.now();
  let acc = 0;
  const STEP = 1000 / 60;
  function loop(now) {
    requestAnimationFrame(loop);
    if (!game.running) { last = now; return; }
    acc += Math.min(now - last, 100);
    last = now;
    while (acc >= STEP) {
      if (game.state === "play" || game.state === "clearing" || game.state === "over") update();
      acc -= STEP;
    }
    draw();
  }
  requestAnimationFrame(loop);
})();
