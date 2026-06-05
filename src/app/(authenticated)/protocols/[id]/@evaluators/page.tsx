import {
  Access,
  Action,
  ProtocolState,
  ReviewType,
  ReviewVerdict,
  Role,
} from '@prisma/client'
import { getReviewsByProtocol } from '@repositories/review'
import { getAllUsersWithoutResearchers } from '@repositories/user'
import { canAccess, canExecute } from '@utils/scopes'
import { getServerSession } from 'next-auth'
import { authOptions } from 'app/api/auth/[...nextauth]/auth'
import { getProtocolMetadata } from '@repositories/protocol'
import { AssignEvaluatorSelector } from '@review/elements/review-assign-select'
import { EvaluatorsDialog } from '@protocol/elements/open-evaluators-dialog'
import { validateChecklistForAssignment } from '@repositories/secretary-checklist'

export default async function ReviewAssignation({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const protocol = await getProtocolMetadata(id)
  if (!session || !protocol) return

  // Teacher Thesis protocols don't have an evaluation flow — they go
  // directly to ADMIN/SECRETARY for approval. Don't render the evaluator UI.
  if (protocol.protocolType === 'TEACHER_THESIS') return null

  if (
    canAccess(Access.EVALUATORS, session.user.role) &&
    protocol.state !== ProtocolState.DRAFT
  ) {
    const reviews = await getReviewsByProtocol(protocol.id)
    const users = await getAllUsersWithoutResearchers()
    if (!users) return null

    const assignedInternal = reviews.find(
      (r) => r.type === ReviewType.SCIENTIFIC_INTERNAL
    )?.reviewerId
    const assignedExternal = reviews.find(
      (r) => r.type === ReviewType.SCIENTIFIC_EXTERNAL
    )?.reviewerId

    const methodologicalVerdict = reviews.find(
      (x) => x.type === ReviewType.METHODOLOGICAL
    )?.verdict

    // Critical-item gate: secretary cannot send the protocol to
    // methodological evaluation until the 5 excluyentes are all "Sí".
    // Admins can still override — they see a warning but the selector is
    // not removed for them.
    const checklistGate = await validateChecklistForAssignment(protocol.id)
    const isAdmin = session.user.role === Role.ADMIN
    const checklistBlocksMethodological =
      !checklistGate.ok && !isAdmin && protocol.state === ProtocolState.PUBLISHED

    const reviewAssignSelectsData = [
      {
        type: ReviewType.METHODOLOGICAL,
        users: users.filter(
          (u) =>
            u.role === Role.METHODOLOGIST && u.id !== protocol.researcher.id
        ),
        enabled:
          canExecute(
            Action.ASSIGN_TO_METHODOLOGIST,
            session.user.role,
            protocol.state
          ) && !checklistBlocksMethodological,
        review:
          reviews.find((review) => review.type === ReviewType.METHODOLOGICAL) ??
          null,
      },
      {
        type: ReviewType.SCIENTIFIC_INTERNAL,
        users: users.filter(
          (u) =>
            u.role === Role.SCIENTIST &&
            assignedExternal !== u.id &&
            u.id !== protocol.researcher.id
        ),
        enabled:
          canExecute(
            Action.ASSIGN_TO_SCIENTIFIC,
            session.user.role,
            protocol.state
          ) &&
          (methodologicalVerdict === ReviewVerdict.APPROVED ||
            methodologicalVerdict === ReviewVerdict.APPROVED_WITH_CHANGES),
        review:
          reviews.find(
            (review) => review.type === ReviewType.SCIENTIFIC_INTERNAL
          ) ?? null,
      },
      {
        type: ReviewType.SCIENTIFIC_EXTERNAL,
        users: users.filter(
          (u) =>
            u.role === Role.SCIENTIST &&
            assignedInternal !== u.id &&
            u.id !== protocol.researcher.id
        ),
        enabled:
          canExecute(
            Action.ASSIGN_TO_SCIENTIFIC,
            session.user.role,
            protocol.state
          ) &&
          (methodologicalVerdict === ReviewVerdict.APPROVED ||
            methodologicalVerdict === ReviewVerdict.APPROVED_WITH_CHANGES),
        review:
          reviews.find(
            (review) => review.type === ReviewType.SCIENTIFIC_EXTERNAL
          ) ?? null,
      },
      {
        type: ReviewType.SCIENTIFIC_THIRD,
        users: users.filter(
          (u) =>
            u.role === Role.SCIENTIST &&
            assignedInternal !== u.id &&
            assignedExternal !== u.id &&
            u.id !== protocol.researcher.id
        ),
        enabled:
          canExecute(
            Action.ASSIGN_TO_SCIENTIFIC,
            session.user.role,
            protocol.state
          ) &&
          reviews.filter(
            (e) =>
              (e.type === ReviewType.SCIENTIFIC_EXTERNAL ||
                e.type === ReviewType.SCIENTIFIC_INTERNAL) &&
              e.verdict !== ReviewVerdict.NOT_REVIEWED
          ).length === 2 &&
          reviews.some((e) => e.verdict === ReviewVerdict.REJECTED),
        review:
          reviews.find(
            (review) => review.type === ReviewType.SCIENTIFIC_THIRD
          ) ?? null,
      },
    ].filter((r) => r.enabled || r.review)
    // Checks if enabled to assign or re-assign, and if has review, it's data is visible (But not necessarily the action)

    return (
      <EvaluatorsDialog>
        <div className="print:hidden">
          {checklistBlocksMethodological && (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
              <div className="mb-1 font-semibold">
                No se puede asignar evaluador metodológico
              </div>
              <div className="mb-2">
                Faltan ítems críticos del checklist de secretaría:
              </div>
              <ul className="ml-4 list-disc space-y-1">
                {checklistGate.missing.map((m) => (
                  <li key={m.key}>
                    {m.label} — <span className="italic">{m.reason}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2">
                Abrí el panel "Checklist" (botón inferior derecho) y completá los
                ítems excluyentes antes de continuar.
              </div>
            </div>
          )}
          {isAdmin && !checklistGate.ok &&
            protocol.state === ProtocolState.PUBLISHED && (
              <div className="mb-3 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-xs text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-100">
                <span className="font-semibold">Atención (admin override):</span>{' '}
                el checklist de secretaría tiene {checklistGate.missing.length}{' '}
                ítem{checklistGate.missing.length === 1 ? '' : 's'} crítico
                {checklistGate.missing.length === 1 ? '' : 's'} sin "Sí". Podés
                continuar pero la asignación quedará registrada con observación
                pendiente.
              </div>
            )}
          {reviewAssignSelectsData.map(
            (data) =>
              data.enabled && (
                <AssignEvaluatorSelector
                  key={data.type}
                  type={data.type}
                  users={data.users}
                  review={data.review}
                  protocolId={protocol.id}
                  protocolState={protocol.state}
                />
              )
          )}
        </div>
      </EvaluatorsDialog>
    )
  }
}
