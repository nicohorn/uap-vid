// The methodology fields moved from their own "Metodología" tab into the
// Descripción tab, where the branch is now driven by the "Tipo de
// investigación según el enfoque metodológico" dropdown. These constants keep
// the legacy `sections.methodology.type` values (still stored, and present on
// protocols created before the move) in sync with the new dropdown.

export const QUANTITATIVE_QUALITATIVE_METHODOLOGY_TYPE =
  'Investigaciones cuantitativas, cualitativas, mixtas o experimentales'

export const THEORETICAL_METHODOLOGY_TYPE = 'Investigaciones de tipo teóricas'

export const THEORETICAL_APPROACH_OPTION = 'Ninguna de estas'

export function methodologyTypeForApproach(
  approach: string | null | undefined
) {
  if (!approach) return ''
  return approach === THEORETICAL_APPROACH_OPTION ?
      THEORETICAL_METHODOLOGY_TYPE
    : QUANTITATIVE_QUALITATIVE_METHODOLOGY_TYPE
}
