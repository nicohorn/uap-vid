import { describe, expect, it } from 'vitest'
import { Action, ProtocolState, Role } from '@prisma/client'
import { canExecute, canOwnerEdit, getActionsByRoleAndState } from './scopes'

const EVALUATION_STATES = [
  ProtocolState.PUBLISHED,
  ProtocolState.METHODOLOGICAL_EVALUATION,
  ProtocolState.SCIENTIFIC_EVALUATION,
] as const

const NON_EVALUATION_STATES = [
  ProtocolState.DRAFT,
  ProtocolState.ACCEPTED,
  ProtocolState.ON_GOING,
  ProtocolState.FINISHED,
  ProtocolState.DISCONTINUED,
  ProtocolState.DELETED,
] as const

describe('ENABLE_OWNER_EDITING scope', () => {
  it.each(EVALUATION_STATES)(
    'secretary and admin can enable owner editing in %s',
    (state) => {
      expect(
        canExecute(Action.ENABLE_OWNER_EDITING, Role.SECRETARY, state)
      ).toBe(true)
      expect(canExecute(Action.ENABLE_OWNER_EDITING, Role.ADMIN, state)).toBe(
        true
      )
    }
  )

  it.each(NON_EVALUATION_STATES)('is not available in %s', (state) => {
    expect(canExecute(Action.ENABLE_OWNER_EDITING, Role.SECRETARY, state)).toBe(
      false
    )
    expect(canExecute(Action.ENABLE_OWNER_EDITING, Role.ADMIN, state)).toBe(
      false
    )
  })

  it.each([Role.RESEARCHER, Role.METHODOLOGIST, Role.SCIENTIST])(
    'role %s cannot enable owner editing',
    (role) => {
      for (const state of EVALUATION_STATES) {
        expect(canExecute(Action.ENABLE_OWNER_EDITING, role, state)).toBe(false)
      }
    }
  )

  it('teacher thesis: available only while PUBLISHED (secretary reviews before accepting)', () => {
    expect(
      canExecute(
        Action.ENABLE_OWNER_EDITING,
        Role.SECRETARY,
        ProtocolState.PUBLISHED,
        'TEACHER_THESIS'
      )
    ).toBe(true)
    for (const state of [ProtocolState.DRAFT, ProtocolState.ACCEPTED]) {
      expect(
        canExecute(
          Action.ENABLE_OWNER_EDITING,
          Role.SECRETARY,
          state,
          'TEACHER_THESIS'
        )
      ).toBe(false)
    }
  })

  it('shows up in the actions offered to a secretary on a published protocol', () => {
    expect(
      getActionsByRoleAndState(Role.SECRETARY, ProtocolState.PUBLISHED)
    ).toContain(Action.ENABLE_OWNER_EDITING)
    expect(
      getActionsByRoleAndState(Role.RESEARCHER, ProtocolState.PUBLISHED)
    ).not.toContain(Action.ENABLE_OWNER_EDITING)
  })
})

describe('FINISH_OWNER_EDITING scope', () => {
  it.each(EVALUATION_STATES)(
    'owner-capable roles can finish corrections in %s',
    (state) => {
      expect(
        canExecute(Action.FINISH_OWNER_EDITING, Role.RESEARCHER, state)
      ).toBe(true)
      expect(
        canExecute(Action.FINISH_OWNER_EDITING, Role.METHODOLOGIST, state)
      ).toBe(true)
    }
  )

  it('is not available to scientists nor outside evaluation states', () => {
    expect(
      canExecute(
        Action.FINISH_OWNER_EDITING,
        Role.SCIENTIST,
        ProtocolState.PUBLISHED
      )
    ).toBe(false)
    for (const state of NON_EVALUATION_STATES) {
      expect(
        canExecute(Action.FINISH_OWNER_EDITING, Role.RESEARCHER, state)
      ).toBe(false)
    }
  })

  it('teacher thesis: available while PUBLISHED', () => {
    expect(
      canExecute(
        Action.FINISH_OWNER_EDITING,
        Role.RESEARCHER,
        ProtocolState.PUBLISHED,
        'TEACHER_THESIS'
      )
    ).toBe(true)
  })
})

describe('canOwnerEdit', () => {
  const researcherOn = (state: ProtocolState, ownerEditingEnabled: boolean) =>
    canOwnerEdit(Role.RESEARCHER, { state, ownerEditingEnabled })

  it('keeps the existing state scope when the flag is off', () => {
    expect(researcherOn(ProtocolState.DRAFT, false)).toBe(true)
    expect(researcherOn(ProtocolState.METHODOLOGICAL_EVALUATION, false)).toBe(
      true
    )
    expect(researcherOn(ProtocolState.SCIENTIFIC_EVALUATION, false)).toBe(true)
    expect(researcherOn(ProtocolState.PUBLISHED, false)).toBe(false)
    expect(researcherOn(ProtocolState.ACCEPTED, false)).toBe(false)
  })

  it('unlocks a PUBLISHED protocol when the flag is on', () => {
    expect(researcherOn(ProtocolState.PUBLISHED, true)).toBe(true)
  })

  it('does not grant editing to roles that never edit as owner', () => {
    expect(
      canOwnerEdit(Role.SCIENTIST, {
        state: ProtocolState.PUBLISHED,
        ownerEditingEnabled: true,
      })
    ).toBe(false)
  })

  it('respects the teacher thesis state scope when the flag is off', () => {
    expect(
      canOwnerEdit(Role.RESEARCHER, {
        state: ProtocolState.PUBLISHED,
        protocolType: 'TEACHER_THESIS',
        ownerEditingEnabled: false,
      })
    ).toBe(false)
  })
})
