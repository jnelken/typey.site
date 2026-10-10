import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// The Tidbyt bridge is its own service (the tidbyt-api repo). The dev server
// forwards typed lines to it so the browser stays same-origin.
const TIDBYT_BRIDGE_URL = 'http://127.0.0.1:8173';

export default defineConfig(() => {
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      proxy: {
        '/api/tidbyt': {
          target: TIDBYT_BRIDGE_URL,
          configure(proxy) {
            // Typing works without a Tidbyt, so a stopped bridge is a quiet
            // 503 rather than a connection error for every line.
            proxy.on('error', (_error, _request, response) => {
              if (response.headersSent || !response.writeHead) return;
              response.writeHead(503, { 'Content-Type': 'application/json' });
              response.end(JSON.stringify({ error: 'tidbyt-api is not running' }));
            });
          },
        },
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
