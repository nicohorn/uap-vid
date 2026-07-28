import { Action, ReviewVerdict, Prisma } from '@prisma/client'
import { ActionsDropdown } from '@protocol/elements/actions-dropdown'
import {
  findProtocolByIdWithResearcher,
  validateTeamForPublish,
} from '@repositories/protocol'
import { getReviewsByProtocol } from '@repositories/review'
import { getActionsByRoleAndState, canExecute } from '@utils/scopes'
import { ProtocolSchema } from '@utils/zod'
import { TeacherThesisSchema } from '@utils/zod/teacher-thesis'

import { authOptions } from 'app/api/auth/[...nextauth]/auth'
import { getServerSession } from 'next-auth'
import { ProtocolStatesDictionary } from '@utils/dictionaries/ProtocolStatesDictionary'

type ProtocolWithResearcher = Prisma.ProtocolGetPayload<{
  include: {
    researcher: { select: { id: true; name: true; email: true } }
    convocatory: { select: { id: true; name: true } }
    anualBudgets: {
      select: { createdAt: true; year: true; id: true; state: true }
    }
    flags: true
  }
}>

export default async function ActionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const protocol = await findProtocolByIdWithResearcher(id)
  if (!protocol || !session) return
  const reviews = await getReviewsByProtocol(protocol.id)

  const actions = getActionsByRoleAndState(
    session.user.role,
    protocol.state,
    protocol.protocolType
  )
  let filteredActions = actions
  const isAdmin = session.user.role === 'ADMIN'

  // Check results for admin override
  const checkResults = {
    publish: {
      isValid: false,
      hasConvocatory: false,
      message: '',
    },
    accept: {
      allReviewed: false,
      message: '',
    },
    approve: {
      allFlagsValid: false,
      hasRequiredFlags: false,
      message: '',
    },
    edit: {
      canEdit: false,
      message: '',
    },
  }

  // Edit by owner
  if (
    !actions.includes(Action.EDIT) &&
    actions.includes(Action.EDIT_BY_OWNER)
  ) {
    if (session.user.id === protocol.researcherId)
      filteredActions.push(Action.EDIT) // I only check for edit in Dropdown, but add it only if is owner.
  }

  // --- Checks for Publish, Accept, and Approve actions ---

  // Tab labels for each sections.* key, used to tell the user WHICH sections
  // are blocking the publish instead of a generic "complete everything".
  // Methodology fields live inside the Descripción tab, hence the shared label.
  const STANDARD_SECTION_LABELS: Record<string, string> = {
    identification: 'Identificación',
    duration: 'Tipo y duración',
    budget: 'Presupuesto',
    description: 'Descripción',
    methodology: 'Descripción',
    introduction: 'Introducción',
    publication: 'Producción',
    bibliography: 'Bibliografía',
  }
  const TT_SECTION_LABELS: Record<string, string> = {
    identification: 'Identificación',
    duration: 'Duración y cronograma',
    description: 'Descripción',
    introduction: 'Introducción',
    method: 'Método',
    publication: 'Publicación',
  }

  // Publish — TT protocols validate only their own sections; standard validates everything.
  const isTeacherThesis = protocol.protocolType === 'TEACHER_THESIS'
  const validToPublish =
    isTeacherThesis
      ? TeacherThesisSchema.safeParse(protocol.sections.teacherThesis)
      : ProtocolSchema.safeParse(protocol)

  // Derive the human-readable list of incomplete sections from the zod issues.
  // Standard issues are rooted at the protocol ("sections.<key>...."), TT
  // issues at sections.teacherThesis ("<key>....").
  const incompleteSections =
    validToPublish.success ? []
    : Array.from(
        new Set(
          validToPublish.error.issues
            .map((issue) =>
              isTeacherThesis ?
                TT_SECTION_LABELS[String(issue.path[0])]
              : issue.path[0] === 'sections' ?
                STANDARD_SECTION_LABELS[String(issue.path[1])]
              : undefined
            )
            .filter((label): label is string => Boolean(label))
        )
      )
  // Standard protocols also need every team member to have a justification
  // and a CV (inline or via their linked UAP user) before they can be
  // published. TT uses a different team shape, so this gate doesn't apply
  // there for now.
  const teamErrors =
    protocol.protocolType !== 'TEACHER_THESIS'
      ? await validateTeamForPublish(protocol)
      : []
  const sectionsValid = validToPublish.success && teamErrors.length === 0
  checkResults.publish.isValid = sectionsValid
  checkResults.publish.hasConvocatory = !!protocol.convocatoryId
  if (!validToPublish.success) {
    checkResults.publish.message =
      incompleteSections.length > 0 ?
        `El protocolo no está completo. ${
          incompleteSections.length === 1 ?
            `Falta completar la sección: ${incompleteSections[0]}.`
          : `Faltan completar las secciones: ${incompleteSections.join(', ')}.`
        }`
      : 'El protocolo no está completo. Debe completar todas las secciones y los campos requeridos.'
  } else if (teamErrors.length > 0) {
    checkResults.publish.message =
      teamErrors.length === 1
        ? teamErrors[0].message
        : `Faltan datos del equipo: ${teamErrors[0].message} (y ${teamErrors.length - 1} más).`
  } else if (!protocol.convocatoryId) {
    checkResults.publish.message =
      'El protocolo no tiene una convocatoria asignada.'
  }
  const publishChecksFailed =
    !checkResults.publish.isValid || !checkResults.publish.hasConvocatory

  // Accept
  const hasUnreviewed = reviews.some(
    (review) => review.verdict === ReviewVerdict.NOT_REVIEWED
  )
  const hasReviews = reviews.length > 0
  checkResults.accept.allReviewed = hasReviews && !hasUnreviewed
  if (!hasReviews) {
    checkResults.accept.message =
      'No hay evaluaciones asignadas al protocolo. Debe asignar al menos un evaluador antes de aceptar el protocolo.'
  } else if (hasUnreviewed) {
    checkResults.accept.message =
      'No todas las evaluaciones han sido completadas. Algunas evaluaciones aún están pendientes.'
  }

  // Approve
  const hasInvalidFlags = protocol.flags.some((flag) => flag.state === false)
  const hasRequiredFlags = protocol.flags.length >= 2
  checkResults.approve.allFlagsValid = !hasInvalidFlags
  checkResults.approve.hasRequiredFlags = hasRequiredFlags
  if (hasInvalidFlags) {
    checkResults.approve.message =
      'Alguno de los votos del protocolo no están aprobadas.'
  } else if (!hasRequiredFlags) {
    checkResults.approve.message =
      'El protocolo no tiene los votos requeridos (se necesitan al menos 2).'
  }
  const approveChecksFailed = hasInvalidFlags || !hasRequiredFlags

  // Edit
  const canEditNormally = canExecute(
    session.user.id === protocol.researcherId ?
      Action.EDIT_BY_OWNER
    : Action.EDIT,
    session.user.role,
    protocol.state,
    protocol.protocolType
  )
  checkResults.edit.canEdit = canEditNormally
  if (!canEditNormally) {
    checkResults.edit.message = `El protocolo está en estado "${ProtocolStatesDictionary[protocol.state]}" y no puede ser editado normalmente. Solo los administradores pueden editar protocolos en este estado.`
  }

  // --- Admin Override Logic: Add actions back if missing ---
  // --- Non-Admin Logic: Filter out actions if checks fail ---

  if (isAdmin) {
    // For Admins, if the action is not in the list due to state or a failed check, add it.
    if (!actions.includes(Action.PUBLISH) || publishChecksFailed) {
      if (!filteredActions.includes(Action.PUBLISH))
        filteredActions.push(Action.PUBLISH)
    }
    if (!actions.includes(Action.ACCEPT) || hasUnreviewed) {
      if (!filteredActions.includes(Action.ACCEPT))
        filteredActions.push(Action.ACCEPT)
    }
    if (!actions.includes(Action.APPROVE) || approveChecksFailed) {
      if (!filteredActions.includes(Action.APPROVE))
        filteredActions.push(Action.APPROVE)
    }
    // For Admins, always ensure EDIT action is available
    if (!filteredActions.includes(Action.EDIT)) {
      filteredActions.push(Action.EDIT)
    }
  }

  // Actions the user's role/state would allow but that fail a business check.
  // Instead of silently hiding them (which left users wondering where the
  // button went), they render disabled with the reason.
  const disabledActions: Partial<Record<Action, string>> = {}

  if (!isAdmin) {
    // For non-Admins, disable actions if they were allowed by state but fail business logic checks.
    if (publishChecksFailed && filteredActions.includes(Action.PUBLISH)) {
      filteredActions = filteredActions.filter((e) => e !== Action.PUBLISH)
      disabledActions[Action.PUBLISH] =
        checkResults.publish.message ||
        'El protocolo no cumple los requisitos para ser publicado.'
    }
    if (hasUnreviewed && filteredActions.includes(Action.ACCEPT)) {
      filteredActions = filteredActions.filter((e) => e !== Action.ACCEPT)
      disabledActions[Action.ACCEPT] =
        checkResults.accept.message ||
        'No todas las evaluaciones han sido completadas.'
    }
    if (approveChecksFailed && filteredActions.includes(Action.APPROVE)) {
      filteredActions = filteredActions.filter((e) => e !== Action.APPROVE)
      disabledActions[Action.APPROVE] =
        checkResults.approve.message ||
        'El protocolo no tiene los votos requeridos.'
    }
  }

  return (
    <ActionsDropdown
      actions={filteredActions}
      disabledActions={disabledActions}
      protocol={protocol}
      canViewLogs={session.user.role === 'ADMIN'}
      userRole={session.user.role}
      checkResults={checkResults}
    />
  )
}
