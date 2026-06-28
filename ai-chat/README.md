# エルルとおしゃべり 🌸 — AI美少女会話アプリ

AIを搭載した美少女キャラクター **「エルル」** と、チャット形式でなんでも会話できる
1ページ完結のWebアプリです。ビルド不要・外部ライブラリ不要で、`index.html` を開くだけで動きます。

Anthropic の **Claude（`claude-opus-4-8`）** を使って応答を生成します。

## 主な機能

- 💬 **チャット形式の会話** — なんでも気軽に質問・雑談できます
- ⚡ **ストリーミング応答** — Claudeの返事が1文字ずつリアルタイムに流れます
- 🧍‍♀️ **立ち絵＆吹き出し** — エルルの5枚の立ち絵が「待機／考え中／お話し中」で切り替わります
- 🌸 **桜の花びら演出** とキュート＆POPな桜カラーUI
- 🎭 **性格カスタマイズ** — 名前やシステムプロンプト（話し方・性格）を自由に編集
- 💾 **会話の自動保存** — 会話履歴・設定はブラウザ内（localStorage）に保存

## 2つの使い方

### A. 単一HTMLファイル版（いちばん簡単）

`eruru-chat.html` を **ダブルクリックして開くだけ**。CSS・JavaScript・立ち絵画像を
すべて1ファイルに埋め込んであるので、これ1つで完結します。配布や持ち運びに便利です。

### B. 分割ファイル版（編集しやすい）

`index.html` / `style.css` / `app.js` / `assets/` の構成。コードを編集・カスタマイズ
したい場合はこちら。`file://` でも動きますが、簡易サーバ経由が安定します。

```bash
python3 -m http.server 8000
# → http://localhost:8000/ai-chat/ を開く
```

## 使い方（共通）

1. **APIキーを用意** — [Anthropic Console](https://console.anthropic.com/settings/keys) で API キー（`sk-ant-...`）を取得
2. **アプリを開く** — `eruru-chat.html`（または `index.html`）をブラウザで開く
3. **設定にキーを入力** — 右上の ⚙️ から API キーを貼り付けて「保存する」
4. **エルルに話しかける** — 入力欄からメッセージを送信。Enterで送信、Shift+Enterで改行

## APIキーの取り扱いについて

このアプリは **サーバを持たない静的Webアプリ** です。

- API キーは **この端末のブラウザ内（localStorage）にのみ保存** され、入力内容と一緒に
  **Anthropic の API へ直接** 送信されます。第三者のサーバには送られません。
- ブラウザから直接 API を呼ぶため、リクエストには
  `anthropic-dangerous-direct-browser-access: true` ヘッダを付与しています。
- 共有端末では使用後に ⚙️ 設定からキーを消すか、🗑️ で履歴をクリアしてください。
- 公開サイトに本番キーを埋め込むのは避け、自分専用・検証用途で使うことをおすすめします。

## キャラクター立ち絵

`assets/` のエルルの立ち絵を、会話の状態に合わせて表示します。

| ファイル名 | 表示される場面 |
| :--------------------------------- | :------------- |
| `story-eruru-sprite.png`           | 待機中（ガッツポーズ） |
| `story-eruru-desperate.png`        | 考え中（手を合わせて思案） |
| `story-eruru-smile.png` ほか        | お話し中（笑顔・泣き笑い・決め顔をランダム表示） |

画像が読み込めない場合は、桜カラーのCSS描画フェイスが自動で表示されます。

## ファイル構成

```
ai-chat/
├── eruru-chat.html  … 単一ファイル版（CSS/JS/画像を内包）
├── index.html       … 分割版・画面のマークアップ
├── style.css        … 桜カラーのスタイル・アニメーション
├── app.js           … チャット処理・Anthropic API 呼び出し（ストリーミング）
├── build-standalone.mjs … eruru-chat.html を生成するスクリプト
└── assets/          … エルルの立ち絵画像
```

## 単一HTMLの再生成

立ち絵やコードを更新したら、次のコマンドで `eruru-chat.html` を作り直せます。

```bash
cd ai-chat && node build-standalone.mjs
```

## 技術メモ

- 使用モデル: `claude-opus-4-8`（`app.js` の `MODEL` で変更可）
- エンドポイント: `POST https://api.anthropic.com/v1/messages`（`stream: true`）
- フレームワーク不使用のバニラ JS / CSS。直近40往復ぶんの履歴を送信します。
