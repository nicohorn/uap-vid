'use server'

import { Action } from '@prisma/client'
import { prisma } from '@utils/bd'
import { emailer } from '@utils/emailer'
import { useCases } from '@utils/emailer/use-cases'
import { canExecute } from '@utils/scopes'
import { logEvent } from '@repositories/log'
import { getSecretariesEmailsByAcademicUnit } from '@repositories/academic-unit'
import { getServerSession } from 'next-auth'
import { authOptions } from 'app/api/auth/[...nextauth]/auth'

type Result = {
  status: boolean
  notification: {
    title: string
    message: string
    intent: 'success' | 'error'
  }
}

const error = (message: string): Result => ({
  status: false,
  notification: { title: 'Error', message, intent: 'error' },
})

/**
 * Who gets told the corrections are done: the secretary/admin who unlocked
 * editing (latest ENABLE_OWNER_EDITING log). If that can't be resolved, fall
 * back to the secretaries of the protocol's academic units — same audience
 * that is notified on publish.
 */
const resolveRecipients = async (
  protocolId: string,
  academicUnitIds: string[]
): Promise<string[]> => {
  const unlock = await prisma.logs.findFirst({
    where: { protocolId, action: Action.ENABLE_OWNER_EDITING },
    orderBy: { createdAt: 'desc' },
    select: { user: { select: { email: true } } },
  })
  if (unlock?.user.email) return [unlock.user.email]

  const units = await Promise.all(
    academicUnitIds.map((id) => getSecretariesEmailsByAcademicUnit(id))
  )
  return units
    .flat()
    .flatMap((u) => u?.secretaries.map((s) => s.email) ?? [])
    .filter((email): email is string => Boolean(email))
}

/**
 * The owner marks the requested corrections as done: closes the unlock set by
 * ENABLE_OWNER_EDITING, logs it (with the owner's optional comment) and emails
 * the secretary who asked for the changes. Counterpart of enableOwnerEditing.
 */
export const finishOwnerEditing = async (
  protocolId: string,
  comment?: string
): Promise<Result> => {
  const session = await getServerSession(authOptions)
  if (!session) return error('Debe iniciar sesión')

  const message = comment?.trim() || null

  try {
    const protocol = await prisma.protocol.findUnique({
      where: { id: protocolId },
      select: {
        state: true,
        protocolType: true,
        researcherId: true,
        ownerEditingEnabled: true,
        sections: { select: { identification: true } },
      },
    })
    if (!protocol) return error('No se encontró el protocolo')

    if (
      protocol.researcherId !== session.user.id ||
      !canExecute(
        Action.FINISH_OWNER_EDITING,
        session.user.role,
        protocol.state,
        protocol.protocolType
      )
    )
      return error(
        'Solo el director del proyecto puede finalizar las correcciones'
      )

    if (!protocol.ownerEditingEnabled)
      return error('La edición del proyecto no está habilitada')

    await prisma.protocol.update({
      where: { id: protocolId },
      data: { ownerEditingEnabled: false },
    })

    await logEvent({
      userId: session.user.id,
      protocolId,
      action: Action.FINISH_OWNER_EDITING,
      previousState: protocol.state,
      message,
      budgetId: null,
      reviewerId: null,
    })

    const recipients = await resolveRecipients(
      protocolId,
      protocol.sections.identification.academicUnitIds
    )
    recipients.forEach((email) =>
      emailer({
        useCase: useCases.onOwnerEditingFinished,
        email,
        protocolId,
        message: message ?? undefined,
      })
    )

    return {
      status: true,
      notification: {
        title: 'Correcciones finalizadas',
        message: 'Se notificó a la Secretaría de Investigación',
        intent: 'success',
      },
    }
  } catch (e) {
    return error('Ocurrió un error al intentar finalizar las correcciones')
  }
}
