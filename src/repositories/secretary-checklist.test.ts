import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('app/api/auth/[...nextauth]/auth', () => ({ authOptions: {} }))
vi.mock('@utils/bd', () => ({
  prisma: { protocol: { findUnique: vi.fn(), update: vi.fn() } },
}))

import { getServerSession } from 'next-auth'
import { prisma } from '@utils/bd'
import { getChecklistObservationsForOwner } from './secretary-checklist'

const PROTOCOL_ID = '000000000000000000000001'
const OWNER_ID = 'researcher-1'

const protocolWithChecklist = (items: unknown[]) => ({
  researcherId: OWNER_ID,
  secretaryChecklist: {
    items,
    updatedAt: null,
    updatedById: null,
    completedAt: null,
  },
})

beforeEach(() => {
  vi.mocked(getServerSession).mockReset()
  vi.mocked(prisma.protocol.findUnique).mockReset()
})

describe('getChecklistObservationsForOwner', () => {
  it('returns only items answered "NO" or commented, in registry order', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: OWNER_ID, role: 'RESEARCHER' },
    } as never)
    vi.mocked(prisma.protocol.findUnique).mockResolvedValue(
      protocolWithChecklist([
        // stored out of registry order on purpose
        { key: 'ethics.ceiDeclared', state: 'NO', comment: null },
        { key: 'identification.titleClear', state: 'YES', comment: '  ' },
        { key: 'duration.scheduleDetailed', state: 'PENDING', comment: null },
        {
          key: 'budget.presentedClearly',
          state: 'YES',
          comment: ' Falta desagregar viáticos ',
        },
      ]) as never
    )

    const observations = await getChecklistObservationsForOwner(PROTOCOL_ID)

    expect(observations.map((o) => o.key)).toEqual([
      'budget.presentedClearly',
      'ethics.ceiDeclared',
    ])
    expect(observations[0]).toMatchObject({
      state: 'YES',
      comment: 'Falta desagregar viáticos',
      critical: false,
    })
    expect(observations[1]).toMatchObject({
      state: 'NO',
      comment: null,
      critical: true,
      category: 'Validaciones éticas',
    })
  })

  it('rejects users that are neither the owner nor secretary/admin', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'someone-else', role: 'RESEARCHER' },
    } as never)
    vi.mocked(prisma.protocol.findUnique).mockResolvedValue(
      protocolWithChecklist([
        { key: 'ethics.ceiDeclared', state: 'NO', comment: null },
      ]) as never
    )

    await expect(
      getChecklistObservationsForOwner(PROTOCOL_ID)
    ).rejects.toThrow('Forbidden')
  })

  it('allows secretaries even when they are not the owner', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'secretary-1', role: 'SECRETARY' },
    } as never)
    vi.mocked(prisma.protocol.findUnique).mockResolvedValue(
      protocolWithChecklist([
        { key: 'ethics.ceiDeclared', state: 'NO', comment: null },
      ]) as never
    )

    const observations = await getChecklistObservationsForOwner(PROTOCOL_ID)
    expect(observations).toHaveLength(1)
  })

  it('returns an empty list when the protocol has no checklist yet', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: OWNER_ID, role: 'RESEARCHER' },
    } as never)
    vi.mocked(prisma.protocol.findUnique).mockResolvedValue({
      researcherId: OWNER_ID,
      secretaryChecklist: null,
    } as never)

    const observations = await getChecklistObservationsForOwner(PROTOCOL_ID)
    expect(observations).toEqual([])
  })
})
