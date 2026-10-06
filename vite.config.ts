import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O app é publicado em albertosennabr.github.io/colmeia/. Quando for para
// colmeia.polinizando.com, trocar base para '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/colmeia/' : '/',
  plugins: [react()],
  server: { port: 3000 },
}))
