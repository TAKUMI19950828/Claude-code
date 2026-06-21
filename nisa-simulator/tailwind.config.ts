import type { Config } from 'tailwindcss';

/**
 * デザイントークン。レビュー反映:
 * - 「白文字を乗せてよい色」と「ink専用（白文字禁止）」を明確に分離（WCAG AA）。
 * - グラフ2系列は明度差を確保（NISA=暖色 / taxable=slate-600）。
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // === 白文字を「乗せてよい」色（実測AAクリア / 4.58:1）===
        primary: { DEFAULT: '#D2441A', hover: '#B83A14', active: '#A8350F' },

        // === ブランドの鮮やか面（白文字を乗せない・背景/装飾/グラフ塗り/マスコット用）===
        coral: { 300: '#FFA98B', 400: '#FF8A66', 500: '#FF6B3D', 600: '#ED5526', 700: '#D2441A' },
        amber: { 300: '#FFD27A', 400: '#FFBE4D', 500: '#F5A623' },

        // === テキスト / 罫線 / 背景（暖色ニュートラル）===
        ink: { DEFAULT: '#3A2A22', soft: '#6B5A50' },
        line: '#F1E4D8',
        surface: { DEFAULT: '#FFFFFF', soft: '#FFF8F3' },
        cream: '#FFFAF6',

        // === セマンティック（地=淡 / 文字=ink or 濃端。白文字は使わない）===
        gain: { DEFAULT: '#16A06A', text: '#0E8A5A', tint: '#E6F7F0' },
        sand: '#C9A88F', // 元本バーの「面」専用・文字色には使わない
        caution: { bg: '#FFF6E0', border: '#F5C24B', text: '#8A5A00' },
        danger: { text: '#C2363B', bg: '#FDECEC' },

        // === グラフ脇役（NISAと明度差を確保）===
        taxable: '#475569',
      },
      fontFamily: {
        rounded: ['"M PLUS Rounded 1c"', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '28px',
        control: '16px',
      },
      boxShadow: {
        // 通常カード（近接影はinkベースで濁りを抑える）
        card: '0 1px 2px rgba(58,42,34,.05), 0 10px 24px rgba(210,68,26,.08)',
        cardhover: '0 2px 6px rgba(58,42,34,.06), 0 16px 34px rgba(210,68,26,.12)',
        // 「硬い色影」はCTAと選択中タブ専用（キャンディ感を温存）
        cta: '0 6px 0 #A8350F',
        ctaactive: '0 2px 0 #A8350F',
      },
      maxWidth: {
        sim: '960px',
        prose: '720px',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .45s cubic-bezier(.22,1,.36,1) both',
        pop: 'pop .25s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
