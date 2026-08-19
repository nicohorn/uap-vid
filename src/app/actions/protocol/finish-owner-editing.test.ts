import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Action, ProtocolState, Role } from '@prisma/client'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('app/api/auth/[...nextauth]/auth', () => ({ authOptions: {} }))
vi.mock('@utils/bd', () => ({
  prisma: {
    protocol: { findUnique: vi.fn(), update: vi.fn() },
    logs: { findFirst: vi.fn() },
  },
}))
vi.mock('@repositories/log', () => ({ logEvent: vi.fn() }))
vi.mock('@repositories/academic-unit', () => ({
  getSecretariesEmailsByAcademicUnit: vi.fn(),
}))
vi.mock('@utils/emailer', () => ({ emailer: vi.fn() }))

import { getServerSession } from 'next-auth'
import { prisma } from '@utils/bd'
import { logEvent } from '@repositories/log'
import { getSecretariesEmailsByAcademicUnit } from '@repositories/academic-unit'
import { emailer } from '@utils/emailer'
import { useCases } from '@utils/emailer/use-cases'
import { finishOwnerEditing } from './finish-owner-editing'

const PROTOCOL_ID = '000000000000000000000001'
const OWNER_ID = 'owner-1'
const SECRETARY_EMAIL = 'secretaria@uap.edu.ar'

const ownerSession = { user: { id: OWNER_ID, role: Role.RESEARCHER } }

const protocolIn = (
  state: ProtocolState,
  {
    ownerEditingEnabled = true,
    researcherId = OWNER_ID,
    protocolType = 'STANDARD',
  } = {}
) => ({
  state,
  protocolType,
  researcherId,
  ownerEditingEnabled,
  sections: { identification: { academicUnitIds: ['au-1'] } },
})

beforeEach(() => {
  vi.mocked(getServerSession).mockReset()
  vi.mocked(prisma.protocol.findUnique).mockReset()
  vi.mocked(prisma.protocol.update).mockReset()
  vi.mocked(prisma.logs.findFirst).mockReset()
  vi.mocked(logEvent).mockReset()
  vi.mocked(getSecretariesEmailsByAcademicUnit).mockReset()
  vi.mocked(emailer).mockReset()
})

describe('finishOwnerEditing', () => {
  it('closes the unlock, logs it and emails the secretary who enabled editing', async () => {
    vi.mocked(getServerSession).mockResolvedValue(ownerSession)
    vi.mocked(prisma.protocol.findUnique).mockResolvedValue(
      protocolIn(ProtocolState.PUBLISHED) as never
    )
    vi.mocked(prisma.logs.findFirst).mockResolvedValue({
      user: { email: SECRETARY_EMAIL },
    } as never)

    const result = await finishOwnerEditing(
      PROTOCOL_ID,
      '  Listo, corregido.  '
    )

    expect(result.status).toBe(true)
    expect(prisma.protocol.update).toHaveBeenCalledWith({
      where: { id: PROTOCOL_ID },
      data: { ownerEditingEnabled: false },
    })
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: OWNER_ID,
        protocolId: PROTOCOL_ID,
        action: Action.FINISH_OWNER_EDITING,
        previousState: ProtocolState.PUBLISHED,
        message: 'Listo, corregido.',
      })
    )
    expect(emailer).toHaveBeenCalledWith({
      useCase: useCases.onOwnerEditingFinished,
      email: SECRETARY_EMAIL,
      protocolId: PROTOCOL_ID,
      message: 'Listo, corregido.',
    })
    expect(getSecretariesEmailsByAcademicUnit).not.toHaveBeenCalled()
  })

  it('accepts an empty comment (logs null, email without message)', async () => {
    vi.mocked(getServerSession).mockResolvedValue(ownerSession)
    vi.mocked(prisma.protocol.findUnique).mockResolvedValue(
      protocolIn(ProtocolState.METHODOLOGICAL_EVALUATION) as never
    )
    vi.mocked(prisma.logs.findFirst).mockResolvedValue({
      user: { email: SECRETARY_EMAIL },
    } as never)

    const result = await finishOwnerEditing(PROTOCOL_ID, '   ')

    expect(result.status).toBe(true)
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ message: null })
    )
    expect(emailer).toHaveBeenCalledWith(
      expect.objectContaining({ message: undefined })
    )
  })

  it('falls back to the academic-unit secretaries when no unlock log exists', async () => {
    vi.mocked(getServerSession).mockResolvedValue(ownerSession)
    vi.mocked(prisma.protocol.findUnique).mockResolvedValue(
      protocolIn(ProtocolState.PUBLISHED) as never
    )
    vi.mocked(prisma.logs.findFirst).mockResolvedValue(null)
    vi.mocked(getSecretariesEmailsByAcademicUnit).mockResolvedValue([
      {
        secretaries: [
          { email: 'sec1@uap.edu.ar' },
          { email: 'sec2@uap.edu.ar' },
        ],
      },
    ] as never)

    const result = await finishOwnerEditing(PROTOCOL_ID)

    expect(result.status).toBe(true)
    expect(getSecretariesEmailsByAcademicUnit).toHaveBeenCalledWith('au-1')
    expect(emailer).toHaveBeenCalledTimes(2)
    expect(emailer).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'sec1@uap.edu.ar' })
    )
  })

  it('is forbidden for anyone who is not the protocol owner', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'someone-else', role: Role.RESEARCHER },
    })
    vi.mocked(prisma.protocol.findUnique).mockResolvedValue(
      protocolIn(ProtocolState.PUBLISHED) as never
    )

    const result = await finishOwnerEditing(PROTOCOL_ID)

    expect(result.status).toBe(false)
    expect(prisma.protocol.update).not.toHaveBeenCalled()
    expect(emailer).not.toHaveBeenCalled()
  })

  it('fails when editing is not currently enabled', async () => {
    vi.mocked(getServerSession).mockResolvedValue(ownerSession)
    vi.mocked(prisma.protocol.findUnique).mockResolvedValue(
      protocolIn(ProtocolState.PUBLISHED, {
        ownerEditingEnabled: false,
      }) as never
    )

    const result = await finishOwnerEditing(PROTOCOL_ID)

    expect(result.status).toBe(false)
    expect(prisma.protocol.update).not.toHaveBeenCalled()
  })

  it('is forbidden outside evaluation states', async () => {
    vi.mocked(getServerSession).mockResolvedValue(ownerSession)
    vi.mocked(prisma.protocol.findUnique).mockResolvedValue(
      protocolIn(ProtocolState.ON_GOING) as never
    )

    const result = await finishOwnerEditing(PROTOCOL_ID)

    expect(result.status).toBe(false)
    expect(prisma.protocol.update).not.toHaveBeenCalled()
  })

  it('works for teacher thesis protocols while PUBLISHED', async () => {
    vi.mocked(getServerSession).mockResolvedValue(ownerSession)
    vi.mocked(prisma.protocol.findUnique).mockResolvedValue(
      protocolIn(ProtocolState.PUBLISHED, {
        protocolType: 'TEACHER_THESIS',
      }) as never
    )
    vi.mocked(prisma.logs.findFirst).mockResolvedValue({
      user: { email: SECRETARY_EMAIL },
    } as never)

    const result = await finishOwnerEditing(PROTOCOL_ID)

    expect(result.status).toBe(true)
  })

  it('rejects users without a session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const result = await finishOwnerEditing(PROTOCOL_ID)

    expect(result.status).toBe(false)
    expect(prisma.protocol.findUnique).not.toHaveBeenCalled()
  })
})
