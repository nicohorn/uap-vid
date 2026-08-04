'use server'

import { prisma } from '@utils/bd'
import {
  CRITICAL_CHECKLIST_KEYS,
  getChecklistItemDef,
} from '@utils/secretary-checklist'
import {
  type SecretaryChecklist,
  type SecretaryChecklistItem,
  SecretaryChecklistSchema,
  ChecklistItemSchema,
} from '@utils/zod/secretary-checklist'
import { getServerSession } from 'next-auth'
import { authOptions } from 'app/api/auth/[...nextauth]/auth'
import { z } from 'zod'

const assertSecretaryOrAdmin = async () => {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')
  if (session.user.role !== 'SECRETARY' && session.user.role !== 'ADMIN') {
    throw new Error('Forbidden: solo secretaría o administrador')
  }
  return session
}

export const getSecretaryChecklist = async (
  protocolId: string
): Promise<SecretaryChecklist | null> => {
  const protocol = await prisma.protocol.findUnique({
    where: { id: protocolId },
    select: { secretaryChecklist: true },
  })
  if (!protocol?.secretaryChecklist) return null
  // Validate + coerce stored data into the schema's shape so the UI always
  // sees the same structure even after schema additions.
  const parsed = SecretaryChecklistSchema.safeParse(protocol.secretaryChecklist)
  return parsed.success ? parsed.data : null
}

export const upsertSecretaryChecklistItems = async (
  protocolId: string,
  updates: SecretaryChecklistItem[]
) => {
  const session = await assertSecretaryOrAdmin()
  const userId = session.user.id

  // Re-validate at the server boundary so malformed item shapes never reach
  // the DB even if a client sends them.
  const parsedUpdates = z.array(ChecklistItemSchema).parse(updates)

  const current = (await getSecretaryChecklist(protocolId)) ?? {
    items: [],
    updatedAt: null,
    updatedById: null,
    completedAt: null,
  }
  // Merge: keep items not touched in this update, overwrite the ones the
  // secretary modified. New items get appended.
  const byKey = new Map(current.items.map((i) => [i.key, i]))
  for (const u of parsedUpdates) {
    byKey.set(u.key, { ...byKey.get(u.key), ...u })
  }
  const next: SecretaryChecklist = {
    ...current,
    items: Array.from(byKey.values()),
    updatedAt: new Date(),
    updatedById: userId,
  }
  await prisma.protocol.update({
    where: { id: protocolId },
    data: { secretaryChecklist: next },
  })
  return next
}

export type ChecklistGateResult = {
  ok: boolean
  missing: { key: string; label: string; reason: string }[]
}

/**
 * Critical-items gate. Used by @evaluators/page.tsx to block
 * ASSIGN_TO_METHODOLOGIST while an "excluyente" item is unanswered or
 * rejected.
 *
 * "N/A" satisfies the gate: several excluyentes genuinely don't apply to
 * every protocol (e.g. functional overlap when the researcher is not an
 * employee), and forcing a "Sí" there would record an answer that isn't true.
 *
 * Blocking reasons:
 *  - item is missing or PENDING — the secretary hasn't reviewed it
 *  - item is NO — the secretary rejected it
 */
export const validateChecklistForAssignment = async (
  protocolId: string
): Promise<ChecklistGateResult> => {
  const checklist = await getSecretaryChecklist(protocolId)
  const byKey = new Map(checklist?.items.map((i) => [i.key, i]) ?? [])
  const missing: ChecklistGateResult['missing'] = []
  for (const key of CRITICAL_CHECKLIST_KEYS) {
    const def = getChecklistItemDef(key)
    if (!def) continue
    const item = byKey.get(key)
    if (!item || item.state === 'PENDING') {
      missing.push({
        key,
        label: def.label,
        reason: 'Pendiente de revisión',
      })
    } else if (item.state === 'NO') {
      missing.push({
        key,
        label: def.label,
        reason: 'Marcado como "No"',
      })
    }
  }
  return { ok: missing.length === 0, missing }
}
