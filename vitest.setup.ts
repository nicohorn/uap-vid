import { vi } from 'vitest'

// `cache` from 'react' only exists in Next's bundled React canary. Repositories
// wrap queries with it, so make it a pass-through when running under vitest.
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return { ...actual, cache: <T>(fn: T) => fn }
})
