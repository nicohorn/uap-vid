import { z } from 'zod'
import {
  APPLICATION_FIELDS,
  DURATION_MONTHS,
  POSTGRADUATE_PROGRAMS,
  PUBLICATION_TYPES,
  RESEARCH_TYPES,
  SOCIOECONOMIC_OBJECTIVES,
  SPONSORING_FACULTIES,
} from '../protocol-types'

const enumFromDict = <K extends string>(dict: Record<K, unknown>) =>
  z.enum(Object.keys(dict) as [K, ...K[]])

const required = (msg = 'El campo no puede estar vacío') =>
  z.string().min(1, { message: msg })

export const TeacherThesisTeamMemberSchema = z.object({
  name: required(),
  role: required(),
  weeklyHours: z.coerce
    .number({ invalid_type_error: 'Debe ser numérico' })
    .int()
    .min(1, { message: 'Debe ser al menos 1' }),
})

export const TeacherThesisIdentificationSchema = z.object({
  year: z.coerce.number().int().positive().nullable().optional(),
  postgraduateProgram: enumFromDict(POSTGRADUATE_PROGRAMS),
  thesisType: required(),
  sponsoringFaculty: enumFromDict(SPONSORING_FACULTIES),
  thesisCandidate: TeacherThesisTeamMemberSchema,
  director: TeacherThesisTeamMemberSchema,
  additionalMembers: TeacherThesisTeamMemberSchema.array().optional().default([]),
  eligibleEvaluators: z
    .string()
    .array()
    .min(1, { message: 'Debe indicar al menos un evaluador elegible' }),
})

export const TeacherThesisScheduleEntrySchema = z.object({
  semester: z.coerce.number().int().min(1).max(10),
  activities: z
    .string()
    .min(1, { message: 'No puede estar vacío' })
    .array()
    .min(1, { message: 'Debe agregar al menos una actividad' }),
})

export const TeacherThesisDurationSchema = z.object({
  durationMonths: enumFromDict(DURATION_MONTHS),
  schedule: TeacherThesisScheduleEntrySchema.array()
    .min(2, { message: 'El cronograma debe tener al menos 2 semestres' })
    .max(10, { message: 'El cronograma no puede tener más de 10 semestres' })
    .refine(
      (entries) => {
        const semesters = entries.map((e) => e.semester).sort((a, b) => a - b)
        return semesters.every((s, i) => s === i + 1)
      },
      { message: 'Los semestres deben ir numerados consecutivamente desde 1' }
    ),
})

export const TeacherThesisDescriptionSchema = z.object({
  generalDiscipline: required(),
  specificArea: required(),
  researchLine: required(),
  technicalAbstract: z.string().refine(
    (s) => {
      const words = s.trim().split(/\s+/).filter(Boolean).length
      return words >= 150 && words <= 250
    },
    { message: 'El resumen técnico debe contener entre 150 y 250 palabras' }
  ),
  keywords: z
    .string()
    .min(1)
    .array()
    .min(4, { message: 'Debe indicar al menos 4 palabras clave' })
    .max(6, { message: 'No puede indicar más de 6 palabras clave' }),
  applicationField: enumFromDict(APPLICATION_FIELDS),
  socioeconomicObjective: enumFromDict(SOCIOECONOMIC_OBJECTIVES),
  researchType: enumFromDict(RESEARCH_TYPES),
})

const richTextRequired = (msg = 'El campo no puede estar vacío') =>
  z.string().refine((html) => html.replace(/<[^>]*>/g, '').trim().length > 0, {
    message: msg,
  })

export const TeacherThesisIntroductionSchema = z.object({
  stateOfTheArt: richTextRequired(),
  justification: richTextRequired(),
  problemDefinition: richTextRequired(),
  objectives: richTextRequired(),
})

export const TeacherThesisMethodSchema = z
  .object({
    design: z.string().nullable().optional().default(''),
    participants: z.string().nullable().optional().default(''),
    location: z.string().nullable().optional().default(''),
    dataCollectionInstruments: z.string().nullable().optional().default(''),
    dataCollectionProcedures: z.string().nullable().optional().default(''),
    dataAnalysis: z.string().nullable().optional().default(''),
    ethicalConsiderations: z.string().nullable().optional().default(''),
    ethicsCommitteeStatus: z.string().nullable().optional().default(''),
    theoreticalMethodology: z.string().nullable().optional().default(''),
  })
  .refine(
    (value) => {
      const theoreticalFilled = !!value.theoreticalMethodology?.trim()
      const empiricalFields = [
        value.design,
        value.participants,
        value.location,
        value.dataCollectionInstruments,
        value.dataCollectionProcedures,
        value.dataAnalysis,
        value.ethicalConsiderations,
        value.ethicsCommitteeStatus,
      ]
      const empiricalFilled = empiricalFields.every((v) => !!v?.trim())
      return theoreticalFilled || empiricalFilled
    },
    {
      message:
        'Complete los campos empíricos o la descripción de metodología teórica',
      path: ['theoreticalMethodology'],
    }
  )

export const TeacherThesisPublicationSchema = z.object({
  publicationType: enumFromDict(PUBLICATION_TYPES),
  publicationPlan: richTextRequired(),
})

export const TeacherThesisIndicatorsSchema = z.object({
  publications: required(),
  rdProjects: required(),
  workSupervision: required(),
  scientificManagement: required(),
  internationalCommittees: required(),
  editorialCommittees: required(),
  awards: required(),
})

export const TeacherThesisEducationEntrySchema = z.object({
  degree: required(),
  institution: required(),
  date: required(),
})

export const TeacherThesisDirectorCvSchema = z.object({
  name: required(),
  education: TeacherThesisEducationEntrySchema.array().min(1, {
    message: 'Debe agregar al menos un título',
  }),
  indicators: TeacherThesisIndicatorsSchema,
})

export const TeacherThesisSchema = z.object({
  identification: TeacherThesisIdentificationSchema,
  duration: TeacherThesisDurationSchema,
  description: TeacherThesisDescriptionSchema,
  introduction: TeacherThesisIntroductionSchema,
  method: TeacherThesisMethodSchema,
  publication: TeacherThesisPublicationSchema,
  directorsCv: TeacherThesisDirectorCvSchema.array().min(1, {
    message: 'Debe cargar el CV del director (y codirectores si los hay)',
  }),
})

export type TeacherThesis = z.infer<typeof TeacherThesisSchema>
