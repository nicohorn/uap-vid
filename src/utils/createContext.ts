'use client'

import { createFormContext } from '@mantine/form'
import type { ProtocolSchema, SectionsSchema } from './zod'
import type { z } from 'zod'

export const [ProtocolProvider, useProtocolContext, useProtocol] =
  createFormContext<z.infer<typeof ProtocolSchema>>()

export const initialSectionValues: z.infer<typeof SectionsSchema> = {
  identification: {
    courseId: null,
    careerId: '',
    academicUnitIds: [],
    team: [
      {
        hours: null,
        last_name: null,
        name: '',
        role: 'Director',
        teamMemberId: null,
        workingMonths: 12,
        toBeConfirmed: false,
        categoryToBeConfirmed: null,
        assignments: [],
      },
    ],
    title: '',
  },
  duration: {
    chronogram: [],
    duration: '',
    modality: '',
  },
  budget: {
    expenses: [
      { type: 'Insumos', data: [] },
      { type: 'Libros', data: [] },
      {
        type: 'Materiales de Impresión',
        data: [],
      },
      { type: 'Viajes', data: [] },
      {
        type: 'Gastos por publicación',
        data: [],
      },
      { type: 'Otros', data: [] },
    ],
  },
  description: {
    discipline: '',
    field: '',
    line: '',
    technical: '',
    objective: '',
    type: '',
    words: '',
    methodologicalApproach: '',
    methodologicalDesign: '',
  },
  introduction: {
    justification: '',
    objectives: '',
    problem: '',
    state: '',
  },
  methodology: {
    considerations: null,
    analysis: null,
    detail: null,
    instruments: null,
    participants: null,
    procedures: null,
    design: null,
    humanAnimalOrDb: null,
    place: null,
    type: '',
  },
  publication: {
    title: '',
    result: '',
    technologicalResult: '',
  },
  bibliography: {
    chart: [],
    content: '',
    entries: [],
  },
  teacherThesis: {
    identification: {
      year: null,
      postgraduateProgram: '',
      thesisType: '',
      sponsoringFaculty: '',
      thesisCandidate: { name: '', role: 'Tesista', weeklyHours: 0 },
      director: { name: '', role: 'Director', weeklyHours: 0 },
      additionalMembers: [],
      eligibleEvaluators: [],
    },
    duration: {
      durationMonths: '',
      schedule: [
        { semester: 1, activities: [] },
        { semester: 2, activities: [] },
      ],
    },
    description: {
      generalDiscipline: '',
      specificArea: '',
      researchLine: '',
      technicalAbstract: '',
      keywords: [],
      applicationField: '',
      socioeconomicObjective: '',
      researchType: '',
    },
    introduction: {
      stateOfTheArt: '',
      justification: '',
      problemDefinition: '',
      objectives: '',
    },
    method: {
      design: '',
      participants: '',
      location: '',
      dataCollectionInstruments: '',
      dataCollectionProcedures: '',
      dataAnalysis: '',
      ethicalConsiderations: '',
      ethicsCommitteeStatus: '',
      theoreticalMethodology: '',
    },
    publication: {
      publicationType: '',
      publicationPlan: '',
    },
  },
} as any
