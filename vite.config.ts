import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { mockApiPlugin } from './server/mockApi';

function mockServerPlugin(): Plugin {
  return {
    name: 'mock-api-server',
    configureServer(server) {
      server.middlewares.use(mockApiPlugin());
    },
  };
}

export default defineConfig({
  plugins: [react(), mockServerPlugin()],
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https://picsum.photos; connect-src 'self' ws://localhost:*; font-src 'self';",
    },
  },
});
