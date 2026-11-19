import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
const M = '/home/claude/mura';
export default defineConfig({
  base: './',
  publicDir: M + '/public',
  plugins: [react(), tailwindcss()],
  define: { 'process.env.NEXT_PUBLIC_BASE_PATH': JSON.stringify('.'), 'process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL': 'undefined' },
  resolve: {
    alias: [
      { find: '@', replacement: M + '/src' },
      { find: 'next/link', replacement: path.resolve('shims/next-link.tsx') },
      { find: 'next/navigation', replacement: path.resolve('shims/next-navigation.ts') },
      { find: /^react$/, replacement: path.resolve('node_modules/react') },
      { find: /^react\/(.*)$/, replacement: path.resolve('node_modules/react') + '/$1' },
      { find: /^react-dom$/, replacement: path.resolve('node_modules/react-dom') },
      { find: /^react-dom\/(.*)$/, replacement: path.resolve('node_modules/react-dom') + '/$1' },
      { find: /^gsap(.*)$/, replacement: path.resolve('node_modules/gsap') + '$1' },
    ],
  },
  build: { outDir: 'dist', assetsDir: 'assets', emptyOutDir: true, chunkSizeWarningLimit: 2000 },
});
