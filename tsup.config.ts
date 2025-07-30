import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  target: 'node19',
  platform: 'node',
  sourcemap: false,
  clean: true,
  bundle: true,
  minify: true,
  dts: true,
  outDir: 'dist',
  noExternal: [/.*/], // Bundle all the dependencies used.
  external: [/@aws-sdk\/*/], // Add more external packages which are already a part of execution environment
  treeshake: true,
  splitting: false,
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.mjs',
  }),
  esbuildOptions(options) {
    options.mainFields = ['module', 'main'];
    options.banner = {
      js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
    };
  },
});
