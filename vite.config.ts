import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// "single" mode inlines everything into one HTML file (used for the claude.ai artifact
// and for quick sharing). The default build is the PWA / Capacitor build in dist/.
export default defineConfig(({ mode }) => {
  const single = mode === 'single';
  return {
    base: './',
    define: {
      __SINGLE__: JSON.stringify(single),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    build: {
      outDir: single ? 'dist-single' : 'dist',
      emptyOutDir: true,
      target: 'es2020',
      assetsInlineLimit: single ? 100_000_000 : 4096,
      cssCodeSplit: false,
      reportCompressedSize: false,
    },
    publicDir: single ? false : 'public',
    plugins: [
      {
        name: 'strip-pwa-tags',
        transformIndexHtml(html: string) {
          return single ? html.replace(/<!--pwa-->[\s\S]*?<!--\/pwa-->/g, '') : html;
        },
      },
      ...(single ? [viteSingleFile({ removeViteModuleLoader: true })] : []),
    ],
    server: { host: true },
    test: { environment: 'node', include: ['tests/**/*.test.ts'] },
  };
});
