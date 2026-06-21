import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// 日本語ツールなので japanese + latin サブセットのみ・使用ウェイト(400/700/800)に限定。
// （全スクリプト版 400.css は @font-face が膨大でCSSが肥大化するため避ける）
import '@fontsource/m-plus-rounded-1c/latin-400.css';
import '@fontsource/m-plus-rounded-1c/latin-700.css';
import '@fontsource/m-plus-rounded-1c/latin-800.css';
import '@fontsource/m-plus-rounded-1c/japanese-400.css';
import '@fontsource/m-plus-rounded-1c/japanese-700.css';
import '@fontsource/m-plus-rounded-1c/japanese-800.css';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
