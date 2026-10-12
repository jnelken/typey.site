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
      // Listen on the wifi so devices on the same network (the kid's iPad)
      // can load the app. The bridge still only sees loopback requests.
      host: true,
      proxy: {
        '/api/tidbyt': {
          target: TIDBYT_BRIDGE_URL,
          configure(proxy) {
            // The bridge only accepts loopback and typey.site origins. Drop the
            // browser's Origin so a LAN page's typed line is treated like the
            // dev server's own request.
            proxy.on('proxyReq', proxyReq => {
              proxyReq.removeHeader('origin');
            });
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
