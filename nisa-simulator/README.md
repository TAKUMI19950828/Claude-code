# NISA資産形成シミュレーター

React + Vite + TypeScript 製の、NISAでの資産形成をシミュレーションできるWebアプリです。

## 機能

- 初期資産・毎月積立額・想定年利・運用年数を入力
- 元本・運用益・最終資産額を表示
- 年ごとの資産推移をグラフ（積み上げエリアチャート）で表示
- スマホでも見やすいレスポンシブデザイン
- ポップで分かりやすいデザイン

## 開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

`dist/` フォルダに静的ファイルが出力されます。

## Netlifyへのデプロイ

このフォルダ（`nisa-simulator/`）をベースディレクトリとして指定し、
`netlify.toml` の設定（Build command: `npm run build`, Publish directory: `dist`）
のままNetlifyに接続するだけで公開できます。

CLIから公開する場合:

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

## 計算方法について

毎月、想定年利を12で割った利率で複利運用される前提の簡易計算です。
実際の運用成果を保証するものではありません。
