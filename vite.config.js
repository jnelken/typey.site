import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createTidbytDevPlugin } from './server/tidbytDevPlugin.js';

export default defineConfig(({ mode }) => {
  // Empty prefix loads server-only variables too. Vite still exposes only
  // VITE_* variables to browser code, so the Tidbyt token stays on the dev
  // server and never enters the client bundle.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      vue(),
      createTidbytDevPlugin({
        apiKey: env.TIDBYT_API_KEY || env.API_KEY,
        deviceId: env.TIDBYT_DEVICE_ID || env.DEVICE_ID,
        fontPath: env.TIDBYT_FONT_PATH,
      }),
    ],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      cors: {
        origin: /^https:\/\/(?:www\.)?typey\.site$/,
        // Let the Tidbyt middleware finish the preflight with the explicit
        // private-network grant instead of ending it inside Vite's CORS layer.
        preflightContinue: true,
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue'],
          },
        },
      },
    },
    base: '/',
  };
});
