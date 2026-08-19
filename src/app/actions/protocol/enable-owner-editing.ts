'use server'

import { Action } from '@prisma/client'
import { prisma } from '@utils/bd'
import { emailer } from '@utils/emailer'
import { useCases } from '@utils/emailer/use-cases'
import { canExecute } from '@utils/scopes'
import { logEvent } from '@repositories/log'
import { getServerSession } from 'next-auth'
import { authOptions } from 'app/api/auth/[...nextauth]/auth'
import { z } from 'zod'

// 'use server' modules may only export async functions, so this stays private.
const ReasonSchema = z
  .string()
  .trim()
  .min(1, 'Debe indicar el motivo por el cual se habilita la edición')

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
 * Lets the protocol owner edit while the protocol is PUBLISHED or under
 * evaluation, without moving it out of its current state. Every call logs the
 * reason (Logs.message) and emails the researcher; the flag is cleared by the
 * next state transition (see updateProtocolStateById).
 */
export const enableOwnerEditing = async (
  protocolId: string,
  reason: string
): Promise<Result> => {
  const session = await getServerSession(authOptions)
  if (!session) return error('Debe iniciar sesión')

  const parsedReason = ReasonSchema.safeParse(reason)
  if (!parsedReason.success) return error(parsedReason.error.issues[0].message)

  try {
    const protocol = await prisma.protocol.findUnique({
      where: { id: protocolId },
      select: {
        state: true,
        protocolType: true,
        researcher: { select: { email: true } },
      },
    })
    if (!protocol) return error('No se encontró el protocolo')

    if (
      !canExecute(
        Action.ENABLE_OWNER_EDITING,
        session.user.role,
        protocol.state,
        protocol.protocolType
      )
    )
      return error(
        'No tiene permisos para habilitar la edición en el estado actual del protocolo'
      )

    await prisma.protocol.update({
      where: { id: protocolId },
      data: { ownerEditingEnabled: true },
    })

    await logEvent({
      userId: session.user.id,
      protocolId,
      action: Action.ENABLE_OWNER_EDITING,
      previousState: protocol.state,
      message: parsedReason.data,
      budgetId: null,
      reviewerId: null,
    })

    emailer({
      useCase: useCases.onOwnerEditingEnabled,
      email: protocol.researcher.email,
      protocolId,
      message: parsedReason.data,
    })

    return {
      status: true,
      notification: {
        title: 'Edición habilitada',
        message:
          'El director del proyecto ya puede editarlo y fue notificado por email',
        intent: 'success',
      },
    }
  } catch (e) {
    return error('Ocurrió un error al intentar habilitar la edición')
  }
}
