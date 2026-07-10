/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // ポップな丸ゴシック（Google Fonts）
        rounded: ['"M PLUS Rounded 1c"', 'sans-serif'],
      },
      colors: {
        // ビビッドなパステル系
        pop: {
          pink: '#ff6fb5',
          purple: '#a970ff',
          blue: '#5cc8ff',
          mint: '#4fe3c1',
          yellow: '#ffd55c',
          orange: '#ff9a5c',
        },
        judge: {
          high: '#ff5c7a',   // 高い = 赤系
          mid: '#ffb03a',    // 平均的 = 黄色系
          low: '#2fc7b0',    // 低い = 青緑系
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        pop: '0 10px 30px -8px rgba(169, 112, 255, 0.45)',
        card: '0 8px 24px -10px rgba(0,0,0,0.15)',
      },
      keyframes: {
        'pop-in': {
          '0%': { opacity: '0', transform: 'translateY(24px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-slide': {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'gradient-move': {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'bar-grow': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.45s cubic-bezier(0.22,1,0.36,1) both',
        'fade-slide': 'fade-slide 0.4s ease both',
        float: 'float 4s ease-in-out infinite',
        wiggle: 'wiggle 0.6s ease-in-out infinite',
        'gradient-move': 'gradient-move 8s ease infinite',
      },
    },
  },
  plugins: [],
}
