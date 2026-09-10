import { describe, expect, it } from 'vitest'
import { cvHref } from './cv'

describe('cvHref', () => {
  it('prefers the inline CV and strips the storage prefix', () => {
    expect(
      cvHref({
        inlineCvFileKey: 'cv/inline/abc.pdf',
        userId: 'u1',
        userHasCv: true,
      })
    ).toBe('/api/files/cv/inline/abc.pdf')
  })

  it('falls back to the linked user CV', () => {
    expect(
      cvHref({ inlineCvFileKey: null, userId: 'u1', userHasCv: true })
    ).toBe('/api/files/cv/u1')
  })

  it('returns null when the user has no CV or there is no user', () => {
    expect(cvHref({ userId: 'u1', userHasCv: false })).toBeNull()
    expect(cvHref({ inlineCvFileKey: null, userId: null })).toBeNull()
  })
})
