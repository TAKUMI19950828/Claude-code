# プリズムディフェンス！ (Prism Defense)

美少女ヒロインがSDキャラとして戦う、横スクロール型のラインディフェンスゲーム MVP。
React + TypeScript + Vite 製。Canvas/PixiJS は使わず DOM/CSS アニメーション中心で実装しています。

## 起動方法

```bash
cd prism-defense
npm install
npm run dev      # 開発サーバー (http://localhost:5173)
npm run build    # 本番ビルド (dist/)
npm run preview  # ビルド結果をプレビュー
```

## デプロイ (Netlify)

`netlify.toml` を同梱しています。リポジトリ直下を指定すれば `base = "prism-defense"`
の設定でそのままビルド・公開できます（`publish = dist`、SPA リダイレクト付き）。

## ゲームの流れ

1. **ホーム** … タイトル・メインヒロイン・メニュー。「出撃」が最も目立つ導線。
2. **ステージ選択** … 3ステージ。最初は1つだけ解放、クリアで次が解放。
3. **バトル** … 時間で資金が増加 → カードでキャラ召喚 → 右へ進軍 → 敵拠点HPを0にで勝利。
   必殺技「プリズムバースト」と撤退ボタンつき。勝敗演出あり。
4. **キャラ / 強化** … 所持キャラ確認・詳細モーダル・コインでレベルアップ。
5. **ガチャ** … 100コインで1回、光る演出つき。
6. **ミッション** … 達成状況を localStorage に保存。

セーブデータは `localStorage` キー `prism-defense-save-v1` に保存されます。

## ディレクトリ構成

```
src/
  App.tsx / main.tsx        … ルーティングとマウント
  styles/                   … global.css (デザイントークン) + components.css
  data/                     … characters / enemies / stages (データ駆動。追加が容易)
  types/game.ts             … ドメイン型
  hooks/                    … useLocalStorage / useGameState (中央状態 & セーブ)
  components/               … 再利用UI (AppShell, Header, BottomNav, GlassPanel,
                              PrimaryButton, CharacterCard, StageCard, UnitCard,
                              HpBar, Modal, BattleField, BattleUnit, ResultOverlay,
                              CurrencyDisplay)
  screens/                  … Home / StageSelect / Battle / Characters / Upgrade /
                              Gacha / Missions
```

## 拡張のしかた

- **キャラ追加**: `data/characters.ts` に1エントリ足すだけで、ロスター・バトルデッキに反映。
- **敵追加**: `data/enemies.ts` に追加し、`stages.ts` の `spawns` で配置。
- **ステージ追加**: `data/stages.ts` に追加（配列順に解放）。
- 画像差し替え: 現在はすべて絵文字 / CSS図形。スプライト部分（`.bunit__sprite`,
  `.char-card__sprite` など）を `<img>` に置き換えるだけで対応可能。

## 効果音 / 音声について

外部素材を使わない方針のため、現状の演出は CSS アニメーション（キラ光・ポップ・
シェイク・バナー）で表現しています。SE/BGM は Web Audio API で軽い合成音を足すか、
`public/` に音声ファイルを置いて差し替える設計です。

## 今後の改善点

- Web Audio による効果音 / BGM
- キャラのスプライト画像・ガチャ排出によるキャラ解放
- ステージのウェーブ演出強化、ボス敵、属性相性
- 編成画面（出撃キャラの選択）、スタミナ消費の実装
- バトルのリプレイ性（スコア・星3条件）、ランキング
- アクセシビリティ（reduced motion 対応）と i18n
