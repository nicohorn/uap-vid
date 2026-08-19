// This component is meant to export helper functionalities in a centralized matter when we come to roles or states.
// Atomic SRP Components that operate with one of these actions, should be guarded by this functions.
// Check if role its allowed access or action

import { Access, Action, ProtocolState, Role } from '@prisma/client'

/** Role Access Scope
 * - Check access to resource according to user role
 */
const Role_ACCESS: { [key in keyof typeof Role]: Access[] } = {
  [Role.RESEARCHER]: [Access.PROTOCOLS, Access.REVIEWS],
  [Role.SECRETARY]: [Access.PROTOCOLS, Access.REVIEWS, Access.EVALUATORS],
  [Role.METHODOLOGIST]: [Access.PROTOCOLS],
  [Role.SCIENTIST]: [Access.PROTOCOLS],
  [Role.ADMIN]: [
    Access.PROTOCOLS,
    Access.CONVOCATORIES,
    Access.REVIEWS,
    Access.EVALUATORS,
    Access.USERS,
    Access.ACADEMIC_UNITS,
    Access.TEAM_MEMBERS,
    Access.MEMBER_CATEGORIES,
    Access.ANUAL_BUDGETS,
    Access.INDEXES,
    Access.CAREERS,
    Access.EVALUATIONS,
    Access.EMAILS,
  ],
}

/** Role Action Scope
 * - Check if action can be performed according to user role
 * - EDIT_BY_OWNER & PUBLISH can only be done for users that are protocol owners.
 */
const Role_SCOPE: { [key in keyof typeof Role]: Action[] } = {
  [Role.RESEARCHER]: [
    Action.CREATE,
    Action.EDIT_BY_OWNER,
    Action.PUBLISH,
    Action.VIEW_ANUAL_BUDGET,
    Action.FINISH_OWNER_EDITING,
  ],
  [Role.SECRETARY]: [
    Action.ACCEPT,
    Action.CREATE,
    Action.EDIT,
    Action.EDIT_BY_OWNER,
    Action.PUBLISH,
    Action.VIEW_ANUAL_BUDGET,
    Action.ASSIGN_TO_METHODOLOGIST,
    Action.ASSIGN_TO_SCIENTIFIC,
    Action.ENABLE_OWNER_EDITING,
    Action.FINISH_OWNER_EDITING,
  ],
  [Role.METHODOLOGIST]: [
    Action.REVIEW,
    Action.CREATE,
    Action.EDIT_BY_OWNER,
    Action.PUBLISH,
    Action.FINISH_OWNER_EDITING,
  ],
  [Role.SCIENTIST]: [Action.REVIEW],
  [Role.ADMIN]: [
    Action.CREATE,
    Action.EDIT,
    Action.EDIT_BY_OWNER,
    Action.PUBLISH,
    Action.ACCEPT,
    Action.APPROVE,
    Action.ASSIGN_TO_METHODOLOGIST,
    Action.ASSIGN_TO_SCIENTIFIC,
    Action.DELETE,
    Action.DISCONTINUE,
    Action.FINISH,
    Action.VIEW_ANUAL_BUDGET,
    Action.GENERATE_ANUAL_BUDGET,
    Action.REACTIVATE,
    Action.ENABLE_OWNER_EDITING,
    Action.FINISH_OWNER_EDITING,
  ],
}

/**
 * Teacher Thesis protocols have a shortened lifecycle (DRAFT → PUBLISHED →
 * ACCEPTED) — no methodologist/scientist evaluation, no anual-budget flow.
 * Approval is direct: SECRETARY or ADMIN flips PUBLISHED to ACCEPTED.
 */
const TT_STATE_SCOPE: { [key in keyof typeof ProtocolState]: Action[] } = {
  [ProtocolState.DRAFT]: [Action.EDIT_BY_OWNER, Action.PUBLISH, Action.DELETE],
  [ProtocolState.PUBLISHED]: [
    Action.ACCEPT,
    Action.EDIT,
    Action.DISCONTINUE,
    // The secretary reviews the thesis before accepting it, so the
    // owner-editing unlock applies here too.
    Action.ENABLE_OWNER_EDITING,
    Action.FINISH_OWNER_EDITING,
  ],
  [ProtocolState.ACCEPTED]: [Action.EDIT, Action.DISCONTINUE],
  [ProtocolState.METHODOLOGICAL_EVALUATION]: [],
  [ProtocolState.SCIENTIFIC_EVALUATION]: [],
  [ProtocolState.ON_GOING]: [],
  [ProtocolState.FINISHED]: [],
  [ProtocolState.DISCONTINUED]: [Action.REACTIVATE],
  [ProtocolState.DELETED]: [],
}

const isTeacherThesis = (protocolType?: string | null) =>
  protocolType === 'TEACHER_THESIS'

const getStateScope = (state: ProtocolState, protocolType?: string | null) =>
  isTeacherThesis(protocolType) ? TT_STATE_SCOPE[state] : STATE_SCOPE[state]

/** ProtocolState Action Scope
 * - Check if an action can be performed according current protocol state
 */
const STATE_SCOPE: { [key in keyof typeof ProtocolState]: Action[] } = {
  [ProtocolState.DRAFT]: [Action.EDIT_BY_OWNER, Action.PUBLISH, Action.DELETE],
  [ProtocolState.PUBLISHED]: [
    Action.ASSIGN_TO_METHODOLOGIST,
    Action.EDIT,
    Action.DISCONTINUE,
    Action.ENABLE_OWNER_EDITING,
    Action.FINISH_OWNER_EDITING,
  ],
  [ProtocolState.METHODOLOGICAL_EVALUATION]: [
    Action.ASSIGN_TO_METHODOLOGIST, // It's a Re-assignation
    Action.EDIT_BY_OWNER,
    Action.REVIEW,
    Action.ASSIGN_TO_SCIENTIFIC,
    Action.DISCONTINUE,
    Action.ENABLE_OWNER_EDITING,
    Action.FINISH_OWNER_EDITING,
  ],
  [ProtocolState.SCIENTIFIC_EVALUATION]: [
    Action.ASSIGN_TO_SCIENTIFIC, // Allows re-assignation
    Action.EDIT_BY_OWNER,
    Action.REVIEW,
    Action.ACCEPT,
    Action.DISCONTINUE,
    Action.ENABLE_OWNER_EDITING,
    Action.FINISH_OWNER_EDITING,
  ],
  [ProtocolState.ACCEPTED]: [
    Action.APPROVE,
    Action.DISCONTINUE,
    Action.EDIT,
    Action.GENERATE_ANUAL_BUDGET,
    Action.VIEW_ANUAL_BUDGET,
  ],
  [ProtocolState.ON_GOING]: [
    Action.FINISH,
    Action.VIEW_ANUAL_BUDGET,
    Action.GENERATE_ANUAL_BUDGET,
    Action.EDIT, // Allow editing (including team members) for ongoing protocols
  ],
  [ProtocolState.FINISHED]: [],
  [ProtocolState.DISCONTINUED]: [Action.REACTIVATE],
  [ProtocolState.DELETED]: [],
}

/**
 * Check Access to resource by current user role
 * @param access
 * @param role
 * @returns
 */
export const canAccess = (access: Access, role: Role) =>
  Role_ACCESS[role].includes(access)

/**
 * Check Execution Permission according to ProtocolState and Role
 * @param action
 * @param role
 * @param state
 * @returns
 */
export const canExecute = (
  action: Action,
  role: Role,
  state: ProtocolState,
  protocolType?: string | null
) =>
  Role_SCOPE[role].includes(action) &&
  getStateScope(state, protocolType).includes(action)

/**
 * Owner edit gate. The state scope decides by default (DRAFT and evaluation
 * stages), but a secretary/admin can additionally unlock editing on a
 * PUBLISHED protocol via ENABLE_OWNER_EDITING, which sets
 * `Protocol.ownerEditingEnabled` (cleared on the next state transition).
 * Callers are still responsible for checking that the user IS the owner.
 */
export const canOwnerEdit = (
  role: Role,
  protocol: {
    state: ProtocolState
    protocolType?: string | null
    ownerEditingEnabled: boolean
  }
) =>
  Role_SCOPE[role].includes(Action.EDIT_BY_OWNER) &&
  (protocol.ownerEditingEnabled ||
    getStateScope(protocol.state, protocol.protocolType).includes(
      Action.EDIT_BY_OWNER
    ))

export const getActionsByRoleAndState = (
  role: Role,
  state: ProtocolState,
  protocolType?: string | null
) =>
  Role_SCOPE[role].filter((action) =>
    getStateScope(state, protocolType).includes(action)
  )
