import { defineConfig } from 'tsup';

export default defineConfig([
  // ESM build
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    outDir: 'dist/esm',
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
    minify: false,
  },
  // CJS build
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    outDir: 'dist/cjs',
    dts: false,
    sourcemap: true,
    clean: false,
    splitting: false,
    treeshake: true,
    minify: false,
    outExtension: () => ({
      js: '.cjs',
    }),
  },
  // CLI build (ESM only, executable)
  {
    entry: ['src/cli/index.ts'],
    format: ['esm'],
    outDir: 'dist/cli',
    dts: false,
    sourcemap: true,
    clean: false,
    splitting: false,
    treeshake: true,
    minify: false,
  },
]);
