import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'node:path';

// SINGLEFILE=1 で「単一HTMLファイル（dist-single/index.html）」をビルドする。
// 通常（Netlify）ビルドは base:'/'・@fontsourceセルフホストのまま。
const singlefile = process.env.SINGLEFILE === '1';

// 単一HTMLでは @fontsource の外部woff参照が file:// で壊れるため、
// フォントは Google Fonts の <link> から読み込み、@fontsource取り込みは空モジュールに差し替える。
const googleFontLink =
  '<link rel="preconnect" href="https://fonts.googleapis.com" />\n' +
  '    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n' +
  '    <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700;800&display=swap" rel="stylesheet" />';

export default defineConfig({
  base: singlefile ? './' : '/',
  plugins: [
    react(),
    ...(singlefile
      ? [
          viteSingleFile(),
          {
            name: 'inject-google-font',
            transformIndexHtml(html: string) {
              return html.replace('</head>', `    ${googleFontLink}\n  </head>`);
            },
          },
        ]
      : []),
  ],
  resolve: {
    alias: singlefile
      ? [{ find: /^@fontsource\/.*$/, replacement: path.resolve(import.meta.dirname, 'src/empty.ts') }]
      : [],
  },
  build: singlefile
    ? { outDir: 'dist-single', assetsInlineLimit: 100_000_000, cssCodeSplit: false }
    : {},
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
