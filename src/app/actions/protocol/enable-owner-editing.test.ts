import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Action, ProtocolState, Role } from '@prisma/client'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('app/api/auth/[...nextauth]/auth', () => ({ authOptions: {} }))
vi.mock('@utils/bd', () => ({
  prisma: { protocol: { findUnique: vi.fn(), update: vi.fn() } },
}))
vi.mock('@repositories/log', () => ({ logEvent: vi.fn() }))
vi.mock('@utils/emailer', () => ({ emailer: vi.fn() }))

import { getServerSession } from 'next-auth'
import { prisma } from '@utils/bd'
import { logEvent } from '@repositories/log'
import { emailer } from '@utils/emailer'
import { useCases } from '@utils/emailer/use-cases'
import { enableOwnerEditing } from './enable-owner-editing'

const PROTOCOL_ID = '000000000000000000000001'
const RESEARCHER_EMAIL = 'director@uap.edu.ar'

const session = (role: Role) => ({ user: { id: 'user-1', role } })

const protocolIn = (
  state: ProtocolState,
  protocolType: string = 'STANDARD'
) => ({
  state,
  protocolType,
  researcher: { email: RESEARCHER_EMAIL },
})

beforeEach(() => {
  vi.mocked(getServerSession).mockReset()
  vi.mocked(prisma.protocol.findUnique).mockReset()
  vi.mocked(prisma.protocol.update).mockReset()
  vi.mocked(logEvent).mockReset()
  vi.mocked(emailer).mockReset()
})

describe('enableOwnerEditing', () => {
  it('unlocks editing, logs the reason and emails the researcher', async () => {
    vi.mocked(getServerSession).mockResolvedValue(session(Role.SECRETARY))
    vi.mocked(prisma.protocol.findUnique).mockResolvedValue(
      protocolIn(ProtocolState.PUBLISHED) as never
    )

    const result = await enableOwnerEditing(
      PROTOCOL_ID,
      '  Falta el aval institucional en la sección Identificación.  '
    )

    expect(result.status).toBe(true)
    expect(prisma.protocol.update).toHaveBeenCalledWith({
      where: { id: PROTOCOL_ID },
      data: { ownerEditingEnabled: true },
    })
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        protocolId: PROTOCOL_ID,
        action: Action.ENABLE_OWNER_EDITING,
        previousState: ProtocolState.PUBLISHED,
        message: 'Falta el aval institucional en la sección Identificación.',
      })
    )
    expect(emailer).toHaveBeenCalledWith({
      useCase: useCases.onOwnerEditingEnabled,
      email: RESEARCHER_EMAIL,
      protocolId: PROTOCOL_ID,
      message: 'Falta el aval institucional en la sección Identificación.',
    })
  })

  it.each([
    ProtocolState.METHODOLOGICAL_EVALUATION,
    ProtocolState.SCIENTIFIC_EVALUATION,
  ])('is allowed for an admin while the protocol is in %s', async (state) => {
    vi.mocked(getServerSession).mockResolvedValue(session(Role.ADMIN))
    vi.mocked(prisma.protocol.findUnique).mockResolvedValue(
      protocolIn(state) as never
    )

    const result = await enableOwnerEditing(
      PROTOCOL_ID,
      'Corregir bibliografía'
    )

    expect(result.status).toBe(true)
    expect(prisma.protocol.update).toHaveBeenCalledTimes(1)
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ previousState: state })
    )
  })

  it('rejects an empty reason without touching the protocol', async () => {
    vi.mocked(getServerSession).mockResolvedValue(session(Role.SECRETARY))

    const result = await enableOwnerEditing(PROTOCOL_ID, '   ')

    expect(result.status).toBe(false)
    expect(result.notification.intent).toBe('error')
    expect(prisma.protocol.findUnique).not.toHaveBeenCalled()
    expect(prisma.protocol.update).not.toHaveBeenCalled()
    expect(logEvent).not.toHaveBeenCalled()
    expect(emailer).not.toHaveBeenCalled()
  })

  it('rejects users without a session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const result = await enableOwnerEditing(PROTOCOL_ID, 'motivo')

    expect(result.status).toBe(false)
    expect(prisma.protocol.update).not.toHaveBeenCalled()
  })

  it.each([Role.RESEARCHER, Role.METHODOLOGIST, Role.SCIENTIST])(
    'is forbidden for role %s',
    async (role) => {
      vi.mocked(getServerSession).mockResolvedValue(session(role))
      vi.mocked(prisma.protocol.findUnique).mockResolvedValue(
        protocolIn(ProtocolState.PUBLISHED) as never
      )

      const result = await enableOwnerEditing(PROTOCOL_ID, 'motivo')

      expect(result.status).toBe(false)
      expect(prisma.protocol.update).not.toHaveBeenCalled()
      expect(logEvent).not.toHaveBeenCalled()
      expect(emailer).not.toHaveBeenCalled()
    }
  )

  it.each([
    ProtocolState.DRAFT,
    ProtocolState.ACCEPTED,
    ProtocolState.ON_GOING,
    ProtocolState.DISCONTINUED,
  ])('is forbidden while the protocol is in %s', async (state) => {
    vi.mocked(getServerSession).mockResolvedValue(session(Role.SECRETARY))
    vi.mocked(prisma.protocol.findUnique).mockResolvedValue(
      protocolIn(state) as never
    )

    const result = await enableOwnerEditing(PROTOCOL_ID, 'motivo')

    expect(result.status).toBe(false)
    expect(prisma.protocol.update).not.toHaveBeenCalled()
  })

  it('is allowed for teacher thesis protocols while PUBLISHED, not after acceptance', async () => {
    vi.mocked(getServerSession).mockResolvedValue(session(Role.SECRETARY))
    vi.mocked(prisma.protocol.findUnique).mockResolvedValue(
      protocolIn(ProtocolState.PUBLISHED, 'TEACHER_THESIS') as never
    )

    const published = await enableOwnerEditing(PROTOCOL_ID, 'motivo')
    expect(published.status).toBe(true)
    expect(prisma.protocol.update).toHaveBeenCalledTimes(1)

    vi.mocked(prisma.protocol.findUnique).mockResolvedValue(
      protocolIn(ProtocolState.ACCEPTED, 'TEACHER_THESIS') as never
    )
    const accepted = await enableOwnerEditing(PROTOCOL_ID, 'motivo')
    expect(accepted.status).toBe(false)
    expect(prisma.protocol.update).toHaveBeenCalledTimes(1)
  })

  it('fails gracefully when the protocol does not exist', async () => {
    vi.mocked(getServerSession).mockResolvedValue(session(Role.SECRETARY))
    vi.mocked(prisma.protocol.findUnique).mockResolvedValue(null)

    const result = await enableOwnerEditing(PROTOCOL_ID, 'motivo')

    expect(result.status).toBe(false)
    expect(prisma.protocol.update).not.toHaveBeenCalled()
  })

  it('returns an error notification if the update throws', async () => {
    vi.mocked(getServerSession).mockResolvedValue(session(Role.SECRETARY))
    vi.mocked(prisma.protocol.findUnique).mockResolvedValue(
      protocolIn(ProtocolState.PUBLISHED) as never
    )
    vi.mocked(prisma.protocol.update).mockRejectedValue(new Error('db down'))

    const result = await enableOwnerEditing(PROTOCOL_ID, 'motivo')

    expect(result.status).toBe(false)
    expect(result.notification.intent).toBe('error')
    expect(logEvent).not.toHaveBeenCalled()
    expect(emailer).not.toHaveBeenCalled()
  })
})
