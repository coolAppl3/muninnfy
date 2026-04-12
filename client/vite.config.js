import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import mdx from '@mdx-js/rollup';
import { visualizer } from 'rollup-plugin-visualizer';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': '"production"',
  },

  plugins: [
    {
      enforce: 'pre',
      ...mdx(),
    },
    react(),
    tailwindcss(),
    svgr({
      svgrOptions: {
        replaceAttrValues: {
          '#D9D9D9': 'currentColor',
        },
      },
    }),

    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  server: {
    port: 3000,
  },

  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
      clearMocks: true,
      screenshots: false,
    },
  },
});
