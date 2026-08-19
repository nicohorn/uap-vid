import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Action, ProtocolState } from '@prisma/client'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('app/api/auth/[...nextauth]/auth', () => ({ authOptions: {} }))
vi.mock('@utils/logging', () => ({
  withLogging: (_name: string, fn: unknown) => fn,
}))
vi.mock('@utils/bd', () => ({
  prisma: { protocol: { update: vi.fn() } },
}))
vi.mock('./log', () => ({ logEvent: vi.fn() }))

import { getServerSession } from 'next-auth'
import { prisma } from '@utils/bd'
import { logEvent } from './log'
import { updateProtocolStateById } from './protocol'

const PROTOCOL_ID = '000000000000000000000001'

beforeEach(() => {
  vi.mocked(getServerSession).mockResolvedValue({
    user: { id: 'secretary-1' },
  } as never)
  vi.mocked(prisma.protocol.update).mockReset()
  vi.mocked(logEvent).mockReset()
})

describe('updateProtocolStateById', () => {
  it('clears the owner-editing unlock on every state transition', async () => {
    vi.mocked(prisma.protocol.update).mockResolvedValue({
      id: PROTOCOL_ID,
      state: ProtocolState.METHODOLOGICAL_EVALUATION,
    } as never)

    const result = await updateProtocolStateById(
      PROTOCOL_ID,
      Action.ASSIGN_TO_METHODOLOGIST,
      ProtocolState.PUBLISHED,
      ProtocolState.METHODOLOGICAL_EVALUATION
    )

    expect(result.status).toBe(true)
    expect(prisma.protocol.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: PROTOCOL_ID },
        data: {
          state: ProtocolState.METHODOLOGICAL_EVALUATION,
          ownerEditingEnabled: false,
        },
      })
    )
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        protocolId: PROTOCOL_ID,
        action: Action.ASSIGN_TO_METHODOLOGIST,
        previousState: ProtocolState.PUBLISHED,
      })
    )
  })
})
