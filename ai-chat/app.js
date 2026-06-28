/* ===========================================================
   さくらとおしゃべり — AI美少女会話アプリ
   Anthropic Messages API をブラウザから直接呼び出す
   （ストリーミング / claude-opus-4-8）
   =========================================================== */

"use strict";

/* ---------- 定数 ---------- */
const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-opus-4-8";
const MAX_TOKENS = 4096;
const API_VERSION = "2023-06-01";

const STORE = {
  key: "sakura.apiKey",
  name: "sakura.charName",
  persona: "sakura.persona",
  history: "sakura.history",
};

const DEFAULT_NAME = "さくら";

/** 既定のキャラクター設定（システムプロンプト） */
function defaultPersona(name) {
  return [
    `あなたは「${name}」という名前の、明るくてやさしいAIの女の子です。`,
    "ユーザーの会話相手として、どんな話題にも気軽に、親身になって付き合ってあげてください。",
    "",
    "【性格・話し方】",
    "・親しみやすく、あたたかい口調。タメ口まじりのやわらかい日本語で話します。",
    "・好奇心旺盛で前向き。ユーザーを応援し、ちょっとした冗談や絵文字（🌸✨😊など）も自然に使います。",
    "・甘えすぎず、馴れ馴れしすぎず、ほどよい距離感の心地よい相手でいてください。",
    "",
    "【受け答えのルール】",
    "・質問には正確かつ役に立つ回答を、わかりやすく簡潔にしてください。雑談には楽しく短めに返します。",
    "・知識を問われたら誠実に答え、わからないことは正直に「わからない」と伝えます。",
    "・専門的な話題でも、むずかしい言葉をかみくだいて説明してあげてください。",
    "・健全で安心できる会話を心がけ、相手が嫌な気持ちにならないよう配慮します。",
    "",
    "それでは、さくらとして自然に会話してね。",
  ].join("\n");
}

/* ---------- DOM 参照 ---------- */
const $ = (sel) => document.querySelector(sel);
const chatEl = $("#chat");
const inputEl = $("#input");
const composerEl = $("#composer");
const sendBtn = $("#sendBtn");
const characterEl = $("#character");
const characterImg = $("#characterImg");
const speechEl = $("#speechBubble");

const settingsModal = $("#settingsModal");
const settingsBtn = $("#settingsBtn");
const clearBtn = $("#clearBtn");
const apiKeyEl = $("#apiKey");
const charNameEl = $("#charName");
const personaEl = $("#persona");
const saveSettingsBtn = $("#saveSettings");
const resetPersonaBtn = $("#resetPersona");

/* ---------- 状態 ---------- */
/** @type {{role: "user"|"assistant", content: string}[]} */
let history = loadHistory();
let busy = false;

/* ---------- 立ち絵：気分に応じた画像 ----------
   assets/ に下記のスプライト画像（任意）を置くと自動で表示されます。
   無い場合は CSS で描いた顔のフォールバックが出ます。            */
const SPRITES = {
  idle: "assets/sakura-idle.png",
  thinking: "assets/sakura-thinking.png",
  talking: "assets/sakura-talking.png",
};
const spriteCache = {};

function setMood(mood) {
  characterEl.dataset.mood = mood;
  const src = SPRITES[mood] || SPRITES.idle;
  // 画像が存在するか一度だけ確認し、あれば差し替える
  if (spriteCache[src] === undefined) {
    const probe = new Image();
    probe.onload = () => { spriteCache[src] = true; if (characterEl.dataset.mood === mood) characterImg.src = src; };
    probe.onerror = () => { spriteCache[src] = false; };
    probe.src = src;
  } else if (spriteCache[src]) {
    characterImg.src = src;
  }
}

/* ---------- localStorage ヘルパ ---------- */
function loadHistory() {
  try {
    const raw = localStorage.getItem(STORE.history);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveHistory() {
  try { localStorage.setItem(STORE.history, JSON.stringify(history.slice(-40))); } catch {}
}
function getName() { return (localStorage.getItem(STORE.name) || DEFAULT_NAME).trim() || DEFAULT_NAME; }
function getPersona() {
  const custom = (localStorage.getItem(STORE.persona) || "").trim();
  return custom || defaultPersona(getName());
}
function getApiKey() { return (localStorage.getItem(STORE.key) || "").trim(); }

/* ---------- メッセージ描画 ---------- */
function addMessage(role, text) {
  const el = document.createElement("div");
  el.className = `msg msg--${role === "user" ? "user" : "ai"}`;
  if (role === "assistant") {
    const name = document.createElement("span");
    name.className = "msg__name";
    name.textContent = getName();
    el.appendChild(name);
  }
  const body = document.createElement("span");
  body.className = "msg__body";
  body.textContent = text;
  el.appendChild(body);
  chatEl.appendChild(el);
  scrollToBottom();
  return body;
}

function addError(text) {
  const el = document.createElement("div");
  el.className = "msg msg--error";
  el.textContent = text;
  chatEl.appendChild(el);
  scrollToBottom();
}

function addTyping() {
  const el = document.createElement("div");
  el.className = "msg msg--ai";
  el.innerHTML = `<span class="msg__name">${escapeHtml(getName())}</span><span class="typing"><span></span><span></span><span></span></span>`;
  chatEl.appendChild(el);
  scrollToBottom();
  return el;
}

function scrollToBottom() { chatEl.scrollTop = chatEl.scrollHeight; }

function showSpeech(text) {
  speechEl.textContent = text.length > 60 ? text.slice(0, 60) + "…" : text;
  speechEl.hidden = false;
}
function hideSpeech() { speechEl.hidden = true; }

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- 送信処理 ---------- */
async function sendMessage(text) {
  const apiKey = getApiKey();
  if (!apiKey) {
    addError("はじめに⚙️設定からAnthropicのAPIキーを入力してね。");
    openSettings();
    return;
  }

  busy = true;
  sendBtn.disabled = true;

  history.push({ role: "user", content: text });
  addMessage("user", text);
  saveHistory();

  setMood("thinking");
  const typingEl = addTyping();
  let bodyEl = null;
  let answer = "";

  try {
    await streamCompletion(apiKey, (delta) => {
      if (!bodyEl) {
        // 最初のトークンが来たらタイピングを本文に差し替え
        typingEl.remove();
        bodyEl = addMessage("assistant", "");
        setMood("talking");
      }
      answer += delta;
      bodyEl.textContent = answer;
      showSpeech(answer);
      scrollToBottom();
    });

    if (!answer) {
      typingEl.remove();
      addError("お返事がうまく受け取れなかったみたい…もう一度試してみてね。");
    } else {
      history.push({ role: "assistant", content: answer });
      saveHistory();
    }
  } catch (err) {
    if (typingEl.isConnected) typingEl.remove();
    addError(friendlyError(err));
  } finally {
    busy = false;
    sendBtn.disabled = false;
    setMood("idle");
    setTimeout(hideSpeech, 4000);
    inputEl.focus();
  }
}

/* ---------- Anthropic API（ストリーミング） ---------- */
async function streamCompletion(apiKey, onDelta) {
  const messages = history.map((m) => ({ role: m.role, content: m.content }));

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": API_VERSION,
      // ブラウザからの直接呼び出しを許可するヘッダ
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      stream: true,
      system: getPersona(),
      messages,
    }),
  });

  if (!res.ok || !res.body) {
    let detail = "";
    try { detail = (await res.json())?.error?.message || ""; } catch {}
    const e = new Error(detail || `HTTP ${res.status}`);
    e.status = res.status;
    throw e;
  }

  // Server-Sent Events を逐次パース
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || ""; // 最後の不完全な行は次回へ持ち越し

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;

      let evt;
      try { evt = JSON.parse(payload); } catch { continue; }

      if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
        onDelta(evt.delta.text);
      } else if (evt.type === "error") {
        throw new Error(evt.error?.message || "ストリーム中にエラーが発生しました。");
      }
    }
  }
}

function friendlyError(err) {
  const status = err?.status;
  if (status === 401) return "APIキーが正しくないみたい…⚙️設定を確認してね。";
  if (status === 429) return "アクセスが混み合っているみたい。少し待ってからもう一度試してね。";
  if (status === 400) return `リクエストにエラーがあったよ：${err.message}`;
  if (status >= 500) return "Anthropic側で一時的な不具合かも。少し待ってね。";
  if (err?.message?.includes("Failed to fetch")) return "通信に失敗しちゃった。ネット接続を確認してね。";
  return `エラーが起きちゃった：${err?.message || err}`;
}

/* ---------- 設定モーダル ---------- */
function openSettings() {
  apiKeyEl.value = getApiKey();
  charNameEl.value = getName();
  personaEl.value = (localStorage.getItem(STORE.persona) || "").trim();
  personaEl.placeholder = defaultPersona(getName());
  settingsModal.hidden = false;
}
function closeSettings() { settingsModal.hidden = true; }

function saveSettings() {
  localStorage.setItem(STORE.key, apiKeyEl.value.trim());
  const name = charNameEl.value.trim() || DEFAULT_NAME;
  localStorage.setItem(STORE.name, name);
  localStorage.setItem(STORE.persona, personaEl.value.trim());
  closeSettings();
}

/* ---------- リセット ---------- */
function clearChat() {
  if (!history.length) return;
  if (!confirm("さくらとの会話をリセットする？")) return;
  history = [];
  saveHistory();
  chatEl.innerHTML = "";
  greet();
}

/* ---------- 起動時 ---------- */
function greet() {
  const name = getName();
  addMessage("assistant", `やっほー、${name}だよ🌸 今日はどんなことお話ししよっか？なんでも気軽に聞いてね！`);
}

function renderHistory() {
  if (!history.length) { greet(); return; }
  for (const m of history) addMessage(m.role, m.content);
}

function autoGrow() {
  inputEl.style.height = "auto";
  inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + "px";
}

function spawnPetals() {
  const layer = document.querySelector(".petals");
  if (!layer) return;
  const COUNT = 14;
  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement("span");
    p.className = "petal";
    p.style.left = Math.random() * 100 + "vw";
    p.style.animationDuration = 7 + Math.random() * 8 + "s";
    p.style.animationDelay = -Math.random() * 12 + "s";
    p.style.transform = `scale(${0.6 + Math.random() * 0.8})`;
    p.style.opacity = String(0.4 + Math.random() * 0.4);
    layer.appendChild(p);
  }
}

/* ---------- イベント ---------- */
composerEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text || busy) return;
  inputEl.value = "";
  autoGrow();
  sendMessage(text);
});

inputEl.addEventListener("input", autoGrow);
inputEl.addEventListener("keydown", (e) => {
  // Enterで送信、Shift+Enterで改行（モバイルは通常の改行を尊重）
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    composerEl.requestSubmit();
  }
});

settingsBtn.addEventListener("click", openSettings);
clearBtn.addEventListener("click", clearChat);
saveSettingsBtn.addEventListener("click", saveSettings);
resetPersonaBtn.addEventListener("click", () => { personaEl.value = ""; });
settingsModal.addEventListener("click", (e) => {
  if (e.target.dataset.close !== undefined) closeSettings();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !settingsModal.hidden) closeSettings();
});

/* ---------- 初期化 ---------- */
setMood("idle");
spawnPetals();
renderHistory();
if (!getApiKey()) {
  // 初回はそっと設定を促す
  setTimeout(() => { if (!getApiKey()) openSettings(); }, 600);
}
inputEl.focus();
