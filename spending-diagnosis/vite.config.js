import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 等のサブパス配信でも動くよう相対パスで出力
export default defineConfig({
  plugins: [react()],
  base: './',
})
