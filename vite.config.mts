import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from "vite-plugin-dts";

const NAME = 'VitePluginVanJS';

const fileName = {
  es: `index.mjs`,
  cjs: `index.cjs`,
};

export default defineConfig({
  base: './',
  plugins: [
    dts({
      outDir: 'dist',
      copyDtsFiles: true,
      rollupTypes: true,
    }),
  ],
  resolve: {
    alias: {
      // '~': resolve(__dirname, 'src'),
      // '@vanjs/h': resolve(__dirname, 'src/jsx/index.ts'),
      // '@vanjs/loader': resolve(__dirname, 'src/loader/index.ts'),
      '@vanjs/setup': 'vite-plugin-vanjs/setup',
      '@vanjs/van': 'vite-plugin-vanjs/van',
      '@vanjs/vanx': 'vite-plugin-vanjs/vanx',
    }
  },
  build: {
    outDir: 'dist',
    target: 'ESNext',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      // entry:'./src/index.ts',
      name: NAME,
      formats: ['es', 'cjs'],
      fileName: (format) => fileName[format],
    },
    sourcemap: true,
  },
});
