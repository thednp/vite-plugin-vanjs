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
  build: {
    minify: 'esbuild',
    emptyOutDir: true,
    outDir: 'dist',
    target: 'ESNext',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: NAME,
      formats: ['es', 'cjs'],
      fileName: (format) => fileName[format],
    },
    sourcemap: true,
  },
});
