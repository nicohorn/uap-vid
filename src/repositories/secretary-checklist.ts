'use server'

import { prisma } from '@utils/bd'
import {
  CHECKLIST_CATEGORIES,
  CHECKLIST_ITEMS,
  CRITICAL_CHECKLIST_KEYS,
  getChecklistItemDef,
  type ChecklistState,
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

export type ChecklistObservation = {
  key: string
  label: string
  category: string
  state: ChecklistState
  comment: string | null
  critical: boolean
}

/**
 * Checklist items the secretary flagged, exposed to the protocol owner so the
 * researcher knows what to correct when the protocol comes back. An item is an
 * observation when the secretary answered "NO" or left a comment — the rest of
 * the checklist (states, pending work) stays internal to Secretaría.
 */
export const getChecklistObservationsForOwner = async (
  protocolId: string
): Promise<ChecklistObservation[]> => {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')

  const protocol = await prisma.protocol.findUnique({
    where: { id: protocolId },
    select: { researcherId: true, secretaryChecklist: true },
  })
  if (!protocol) return []

  const isOwner = session.user.id === protocol.researcherId
  const isStaff =
    session.user.role === 'SECRETARY' || session.user.role === 'ADMIN'
  if (!isOwner && !isStaff)
    throw new Error('Forbidden: solo el director del proyecto o secretaría')

  const parsed = SecretaryChecklistSchema.safeParse(protocol.secretaryChecklist)
  if (!parsed.success) return []

  const byKey = new Map(parsed.data.items.map((i) => [i.key, i]))
  const observations: ChecklistObservation[] = []
  // Iterate the registry (not the stored items) so observations come out in
  // the same order the checklist shows them to the secretary.
  for (const def of CHECKLIST_ITEMS) {
    const item = byKey.get(def.key)
    if (!item) continue
    const comment = item.comment?.trim() ? item.comment.trim() : null
    if (item.state !== 'NO' && !comment) continue
    observations.push({
      key: def.key,
      label: def.label,
      category: CHECKLIST_CATEGORIES[def.category],
      state: item.state,
      comment,
      critical: Boolean(def.critical),
    })
  }
  return observations
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
