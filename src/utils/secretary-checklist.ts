// Central registry for the Secretaría de Investigación pre-evaluation
// checklist. Drives the UI, Zod validation, the AI prompt, and the
// "critical items gate" that blocks assigning evaluators while any of the 5
// excluyentes is left unanswered or rejected.
//
// Source: "Lista borrador para plataforma - SI - RP1.pdf" (client).

export type ChecklistCategory =
  | 'identification'
  | 'duration'
  | 'budget'
  | 'description'
  | 'introduction'
  | 'publication'
  | 'bibliography'
  | 'ethics'
  | 'institutional'
  | 'functionalCompatibility'

export type ChecklistState = 'YES' | 'NO' | 'NOT_APPLICABLE' | 'PENDING'

export type ChecklistItemDef = {
  /** Stable identifier persisted in the DB. Never change after release. */
  key: string
  category: ChecklistCategory
  label: string
  /**
   * Marks the 5 excluyentes from the PDF. While any critical item is left
   * PENDING or answered "NO", the protocol cannot advance to
   * METHODOLOGICAL_EVALUATION. "N/A" resolves the item like "YES" does —
   * these checks don't apply to every protocol.
   */
  critical?: boolean
  /** Hint shown to the secretary and included in the AI prompt context. */
  hint?: string
}

export const CHECKLIST_CATEGORIES: Record<ChecklistCategory, string> = {
  identification: 'Identificación del proyecto',
  duration: 'Duración y planificación',
  budget: 'Presupuesto',
  description: 'Descripción general del proyecto',
  introduction: 'Introducción',
  publication: 'Productos y publicación',
  bibliography: 'Bibliografía',
  ethics: 'Validaciones éticas',
  institutional: 'Validaciones institucionales',
  functionalCompatibility: 'Compatibilidad funcional del investigador',
}

export const CHECKLIST_ITEMS: ChecklistItemDef[] = [
  // Identificación
  {
    key: 'identification.titleClear',
    category: 'identification',
    label:
      'El título es claro, específico y coherente con el contenido del proyecto',
  },
  {
    key: 'identification.areaIdentified',
    category: 'identification',
    label:
      'Carrera, asignatura o área académica vinculada correctamente identificada',
  },
  {
    key: 'identification.teamComplete',
    category: 'identification',
    label: 'Equipo de investigación completo (director/a, integrantes)',
  },
  {
    key: 'identification.rolesDefined',
    category: 'identification',
    label: 'Roles y responsabilidades del equipo claramente definidos',
  },
  {
    key: 'identification.totalHoursDeclared',
    category: 'identification',
    label: 'Carga horaria total del proyecto declarada',
  },
  {
    key: 'identification.formationPertinent',
    category: 'identification',
    label:
      'La formación profesional de los/as investigadores/as es pertinente al tema de investigación',
  },

  // Duración y planificación
  {
    key: 'duration.durationConsistent',
    category: 'duration',
    label:
      'La duración propuesta es consistente con los objetivos y alcances del proyecto',
  },
  {
    key: 'duration.scheduleDetailed',
    category: 'duration',
    label:
      'El cronograma detalla las actividades previstas por período (semestres/años)',
  },
  {
    key: 'duration.scheduleCoherent',
    category: 'duration',
    label: 'Existe coherencia general entre objetivos, actividades y cronograma',
  },

  // Presupuesto
  {
    key: 'budget.presentedClearly',
    category: 'budget',
    label: 'Presupuesto presentado de manera clara y desagregada',
  },
  {
    key: 'budget.booksSpecified',
    category: 'budget',
    label: 'Libros y material bibliográfico: título, autor y editorial especificados',
  },
  {
    key: 'budget.travelLinked',
    category: 'budget',
    label: 'Viajes: destino y finalidad vinculada con actividades de investigación',
  },
  {
    key: 'budget.distributedAcrossYears',
    category: 'budget',
    label: 'Distribución en los años que durará el proyecto',
  },
  {
    key: 'budget.distributionMatchesDuration',
    category: 'budget',
    label: 'Distribución del presupuesto acorde con la duración del proyecto',
  },
  {
    key: 'budget.activitiesResourcesCoherent',
    category: 'budget',
    label:
      'Coherencia general entre actividades propuestas y recursos solicitados',
  },

  // Descripción general del proyecto
  {
    key: 'description.disciplineDefined',
    category: 'description',
    label: 'Disciplina y área de conocimiento correctamente definidas',
  },
  {
    key: 'description.lineIdentified',
    category: 'description',
    label: 'Línea de investigación oficial claramente identificada',
  },
  {
    key: 'description.applicationFieldExplicit',
    category: 'description',
    label: 'Campo de aplicación o ámbito de impacto explicitado',
  },
  {
    key: 'description.socioeconomicObjectiveIdentified',
    category: 'description',
    label: 'Objetivo socioeconómico o institucional identificado',
  },
  {
    key: 'description.researchTypeDeclared',
    category: 'description',
    label:
      'Tipo de investigación declarado (exploratoria, descriptiva, explicativa, etc.)',
  },

  // Introducción
  {
    key: 'introduction.contextualized',
    category: 'introduction',
    label: 'El tema se presenta contextualizado en el campo disciplinar',
  },
  {
    key: 'introduction.problemExplicit',
    category: 'introduction',
    label: 'El problema de investigación se encuentra claramente explicitado',
  },
  {
    key: 'introduction.justified',
    category: 'introduction',
    label:
      'Se justifica la relevancia, pertinencia y potencial aporte del estudio',
  },
  {
    key: 'introduction.objectivesCompatible',
    category: 'introduction',
    label:
      'Los objetivos generales y específicos resultan compatibles con el planteo',
  },

  // Productos y publicación
  {
    key: 'publication.productDefined',
    category: 'publication',
    label: 'Tipo de producto esperado definido (artículo, libro, informe, etc.)',
  },
  {
    key: 'publication.planFeasible',
    category: 'publication',
    label: 'Existe un plan de publicación o difusión factible',
  },

  // Bibliografía
  {
    key: 'bibliography.included',
    category: 'bibliography',
    label: 'Bibliografía preliminar incluida',
  },
  {
    key: 'bibliography.referencesCurrent',
    category: 'bibliography',
    label: 'Referencias pertinentes y actualizadas para el tema',
  },
  {
    key: 'bibliography.aiUseDeclared',
    category: 'bibliography',
    label:
      'Declaración y verificación del uso responsable de herramientas de IA, si corresponde',
  },

  // Validaciones éticas (CRÍTICO)
  {
    key: 'ethics.ceiDeclared',
    category: 'ethics',
    critical: true,
    label:
      'El protocolo indica si requiere evaluación por un Comité de Ética en Investigación (CEI)',
    hint: 'Item excluyente. Si no se declara, el proyecto no continúa el circuito.',
  },
  {
    key: 'ethics.conflictsDeclared',
    category: 'ethics',
    critical: true,
    label: 'Se prevé declaración de posibles conflictos de interés',
    hint: 'Item excluyente. Si no se declara, el proyecto no continúa el circuito.',
  },
  {
    key: 'ethics.fundingInformed',
    category: 'ethics',
    critical: true,
    label:
      'Se informa la fuente de financiamiento o la posibilidad de financiamiento externo',
    hint: 'Item excluyente. Si no se informa, el proyecto no continúa el circuito.',
  },
  {
    key: 'ethics.externalAgreementsExplicit',
    category: 'ethics',
    label:
      'Se explicita la necesidad de convenios o autorizaciones con entidades externas, si corresponde',
  },

  // Validaciones institucionales (CRÍTICO)
  {
    key: 'institutional.formalAuthorization',
    category: 'institutional',
    label:
      'Cuenta con autorización formal de los departamentos o áreas involucradas',
  },
  {
    key: 'institutional.institutionalBacking',
    category: 'institutional',
    critical: true,
    label: 'Posee aval institucional correspondiente',
    hint: 'Item excluyente. Si falta el aval, el proyecto no continúa el circuito.',
  },
  {
    key: 'institutional.collegialApproval',
    category: 'institutional',
    label: 'Cuenta con aprobación de cuerpos colegiados, cuando aplique',
  },
  {
    key: 'institutional.noDuplication',
    category: 'institutional',
    label: 'El proyecto no duplica actividades operativas o académicas existentes',
  },
  {
    key: 'institutional.addedValue',
    category: 'institutional',
    label: 'Se justifica claramente el valor agregado investigativo del proyecto',
  },

  // Compatibilidad funcional del investigador (incluye 1 crítico: superposición funcional)
  {
    key: 'functionalCompatibility.notSameAsJob',
    category: 'functionalCompatibility',
    critical: true,
    label:
      'El/la investigador/a no investiga exactamente sus tareas laborales habituales',
    hint:
      'Item excluyente. Superposición funcional no justificada → el proyecto no continúa el circuito.',
  },
  {
    key: 'functionalCompatibility.noDoubleFunding',
    category: 'functionalCompatibility',
    label: 'No existe doble financiamiento para una misma actividad',
  },
  {
    key: 'functionalCompatibility.functionsSeparated',
    category: 'functionalCompatibility',
    label:
      'Se explicita la separación entre funciones laborales y funciones de investigación',
  },
  {
    key: 'functionalCompatibility.hoursDifferentiated',
    category: 'functionalCompatibility',
    label: 'La carga horaria es compatible y claramente diferenciada',
  },
  {
    key: 'functionalCompatibility.approachJustified',
    category: 'functionalCompatibility',
    label:
      'Se justifica la diferencia entre el enfoque operativo y el enfoque investigativo',
  },
]

export const CHECKLIST_KEYS = CHECKLIST_ITEMS.map((i) => i.key)

const ITEMS_BY_KEY = new Map(CHECKLIST_ITEMS.map((i) => [i.key, i]))
export const getChecklistItemDef = (key: string) => ITEMS_BY_KEY.get(key)

export const CRITICAL_CHECKLIST_KEYS = CHECKLIST_ITEMS.filter(
  (i) => i.critical
).map((i) => i.key)

export const itemsByCategory = (): Record<ChecklistCategory, ChecklistItemDef[]> => {
  const out = {} as Record<ChecklistCategory, ChecklistItemDef[]>
  for (const cat of Object.keys(CHECKLIST_CATEGORIES) as ChecklistCategory[]) {
    out[cat] = []
  }
  for (const item of CHECKLIST_ITEMS) {
    out[item.category].push(item)
  }
  return out
}
