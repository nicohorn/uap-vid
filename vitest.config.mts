import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Resolves the tsconfig `paths` (@utils/*, @repositories/*, ...) and the
    // `baseUrl: ./src` bare imports (e.g. 'app/api/auth/...') used across src.
    tsconfigPaths: true,
  },
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
  },
})
