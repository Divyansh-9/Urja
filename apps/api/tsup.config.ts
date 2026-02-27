import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/server.ts'],
    format: ['cjs'],
    outDir: 'dist',
    target: 'node18',
    clean: true,
    noExternal: [
        '@fitmind/shared-types',
        '@fitmind/user-context',
        '@fitmind/workout-engine',
        '@fitmind/nutrition-db',
        '@fitmind/ai-engine',
    ],
    skipNodeModulesBundle: true,
});
