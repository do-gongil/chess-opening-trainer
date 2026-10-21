/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // GitHub Pages 의 /<repo>/ 하위 경로에서도 정적 파일을 찾도록 상대 경로
  plugins: [react()],
  test: { environment: 'node' },
})
