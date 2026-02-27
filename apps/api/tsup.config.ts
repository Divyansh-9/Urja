import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/server.ts'],
    format: ['cjs'],
    outDir: 'dist',
    target: 'node18',
    clean: true,
    noExternal: [/.*/],
    external: [],
});
