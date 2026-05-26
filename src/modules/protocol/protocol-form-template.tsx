'use client'

import { notifications } from '@elements/notifications'
import { zodResolver } from '@mantine/form'
import type { Protocol } from '@prisma/client'
import {
  BibliographyForm,
  BudgetForm,
  DescriptionForm,
  DurationForm,
  IdentificationForm,
  IntroductionForm,
  PublicationForm,
} from '@protocol/form-sections'
import { TtIdentificationForm } from '@protocol/form-sections/teacher-thesis/identification-form'
import { TtDurationForm } from '@protocol/form-sections/teacher-thesis/duration-form'
import { TtDescriptionForm } from '@protocol/form-sections/teacher-thesis/description-form'
import { TtIntroductionForm } from '@protocol/form-sections/teacher-thesis/introduction-form'
import { TtMethodForm } from '@protocol/form-sections/teacher-thesis/method-form'
import { TtPublicationForm } from '@protocol/form-sections/teacher-thesis/publication-form'
import { TtDirectorsCvForm } from '@protocol/form-sections/teacher-thesis/directors-cv-form'
import { ProtocolSchema } from '@utils/zod'
import { IdentificationDraftSchema } from '@utils/zod/protocol'
import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import {
  AlertCircle,
  ArrowNarrowLeft,
  ArrowNarrowRight,
  CircleCheck,
  CircleDashed,
} from 'tabler-icons-react'
import { ProtocolProvider, useProtocol } from 'utils/createContext'
import InfoTooltip from './elements/tooltip'
import { cx } from '@utils/cx'
import { BadgeButton } from '@components/badge'
import { SubmitButton } from '@shared/submit-button'
import { Button } from '@components/button'
import type { z } from 'zod'
import { createProtocol, updateProtocolById } from '@repositories/protocol'
import { ClearLocalStorageButton } from 'modules/clear-local-storage-button'
import { chartToBibliographyHtml } from '@utils/bibliography'
import type { ProtocolType } from '@utils/protocol-types'

type SectionDef = {
  key: string
  path: string
  label: string
  render: () => JSX.Element
}

const standardSections: SectionDef[] = [
  { key: '0', path: 'sections.identification', label: 'Identificación', render: () => <IdentificationForm /> },
  { key: '1', path: 'sections.duration', label: 'Tipo y duración', render: () => <DurationForm /> },
  { key: '2', path: 'sections.budget', label: 'Presupuesto', render: () => <BudgetForm /> },
  { key: '3', path: 'sections.description', label: 'Descripción', render: () => <DescriptionForm /> },
  { key: '4', path: 'sections.introduction', label: 'Introducción', render: () => <IntroductionForm /> },
  { key: '5', path: 'sections.publication', label: 'Producción', render: () => <PublicationForm /> },
  { key: '6', path: 'sections.bibliography', label: 'Bibliografía', render: () => <BibliographyForm /> },
]

const teacherThesisSections: SectionDef[] = [
  { key: '0', path: 'sections.teacherThesis.identification', label: 'Identificación', render: () => <TtIdentificationForm /> },
  { key: '1', path: 'sections.teacherThesis.duration', label: 'Duración y cronograma', render: () => <TtDurationForm /> },
  { key: '2', path: 'sections.teacherThesis.description', label: 'Descripción', render: () => <TtDescriptionForm /> },
  { key: '3', path: 'sections.teacherThesis.introduction', label: 'Introducción', render: () => <TtIntroductionForm /> },
  { key: '4', path: 'sections.teacherThesis.method', label: 'Método', render: () => <TtMethodForm /> },
  { key: '5', path: 'sections.teacherThesis.publication', label: 'Publicación', render: () => <TtPublicationForm /> },
  { key: '6', path: 'sections.bibliography', label: 'Bibliografía', render: () => <BibliographyForm /> },
  { key: '7', path: 'sections.teacherThesis.directorsCv', label: 'CV del director', render: () => <TtDirectorsCvForm /> },
]

const getSectionsForType = (type: ProtocolType | string | undefined): SectionDef[] =>
  type === 'TEACHER_THESIS' ? teacherThesisSections : standardSections

const sanitizeObjectId = (value: string | null | undefined) =>
  value === '' ? null : value

const clearInvalidLocalStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const tempProtocol = localStorage.getItem('temp-protocol')
      if (tempProtocol) {
        const parsed = JSON.parse(tempProtocol)
        const hasInvalidHours = parsed?.sections?.identification?.team?.some(
          (member: any) =>
            member.hours === 0 ||
            member.assignments?.some(
              (assignment: any) => assignment.hours === 0
            )
        )
        if (hasInvalidHours) {
          localStorage.removeItem('temp-protocol')
          return
        }

        const bibliography = parsed?.sections?.bibliography
        const hasLegacyBibliography =
          bibliography && bibliography.chart?.length > 0
        if (hasLegacyBibliography) {
          parsed.sections.bibliography = {
            chart: [],
            content: chartToBibliographyHtml(bibliography.chart),
          }
          localStorage.setItem('temp-protocol', JSON.stringify(parsed))
        }
      }
    } catch (error) {
      localStorage.removeItem('temp-protocol')
    }
  }
}

const getDefaultTeacherThesis = () => ({
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
  publication: { publicationType: '', publicationPlan: '' },
  directorsCv: [],
})

const getDefaultSections = () => ({
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
  },
  identification: {
    courseId: null,
    careerId: '',
    academicUnitIds: [],
    title: '',
    team: [
      {
        hours: null,
        last_name: '',
        name: 'Director del Proyecto',
        role: 'Director',
        teamMemberId: null,
        workingMonths: 12,
        toBeConfirmed: false,
        categoryToBeConfirmed: null,
        assignments: [],
      },
    ],
  },
  teacherThesis: getDefaultTeacherThesis(),
})

const sanitizeTeamMember = (member: any) => ({
  ...member,
  hours:
    typeof member.hours === 'string' ? parseInt(member.hours) || null
      : member.hours === 0 ? null
        : member.hours,
  teamMemberId: sanitizeObjectId(member.teamMemberId),
  categoryToBeConfirmed: sanitizeObjectId(member.categoryToBeConfirmed),
  assignments: (member.assignments || []).map((assignment: any) => ({
    ...assignment,
    hours:
      typeof assignment.hours === 'string' ? parseInt(assignment.hours) || 1
        : assignment.hours === 0 ? 1
          : assignment.hours,
  })),
})

const sanitizeProtocolData = (protocol: any) => {
  const defaults = getDefaultSections()

  return {
    ...protocol,
    protocolType: protocol.protocolType || 'STANDARD',
    protocolSubtype: protocol.protocolSubtype || null,
    convocatoryId: sanitizeObjectId(protocol.convocatoryId),
    sections: {
      ...protocol.sections,
      identification: {
        ...defaults.identification,
        ...protocol.sections.identification,
        courseId: sanitizeObjectId(protocol.sections.identification?.courseId),
        careerId: protocol.sections.identification?.careerId || '',
        academicUnitIds:
          protocol.sections.identification?.academicUnitIds || [],
        team:
          protocol.sections.identification?.team?.map(sanitizeTeamMember) ||
          defaults.identification.team,
      },
      introduction: {
        ...protocol.sections.introduction,
        problem: protocol.sections.introduction?.problem || '',
        state: protocol.sections.introduction?.state || '',
      },
      methodology: protocol.sections.methodology || defaults.methodology,
      publication: protocol.sections.publication || defaults.publication,
      bibliography: (() => {
        const incoming = protocol.sections.bibliography
        if (!incoming) return defaults.bibliography
        const hasContent =
          typeof incoming.content === 'string' &&
          incoming.content.trim().length > 0
        return {
          chart: incoming.chart ?? [],
          content:
            hasContent ? incoming.content : chartToBibliographyHtml(incoming.chart),
        }
      })(),
      teacherThesis:
        protocol.sections.teacherThesis ?? defaults.teacherThesis,
    },
  }
}

export default function ProtocolForm({
  protocol,
}: {
  protocol: z.infer<typeof ProtocolSchema>
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [section, setSection] = useState(pathname?.split('/')[3] || '0')

  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    clearInvalidLocalStorage()
  }, [])

  const form = useProtocol({
    initialValues:
      (
        pathname?.split('/')[2] === 'new' &&
        typeof window !== 'undefined' &&
        localStorage.getItem('temp-protocol')
      ) ?
        JSON.parse(localStorage.getItem('temp-protocol')!)
        : protocol,
    validate: zodResolver(ProtocolSchema),
    validateInputOnBlur: true,
  })

  const sections = useMemo(
    () => getSectionsForType(form.values.protocolType),
    [form.values.protocolType]
  )

  // Keep the active section in bounds when the type (and therefore section list) changes
  useEffect(() => {
    if (!sections.find((s) => s.key === section)) {
      setSection('0')
    }
  }, [sections, section])

  useEffect(() => {
    const validKeys = sections.map((s) => s.key)
    if (
      pathname &&
      !validKeys.includes(pathname?.split('/')[3])
    ) {
      router.push('/protocols/' + pathname?.split('/')[2] + '/0')
    }
  }, [pathname, router, sections])

  const upsertProtocol = useCallback(
    async (protocol: z.infer<typeof ProtocolSchema>) => {
      const { id, ...restOfProtocol } = protocol

      if (!id) {
        const completeProtocol = sanitizeProtocolData(
          restOfProtocol as Protocol
        )

        try {
          const created = await createProtocol(completeProtocol as Protocol)

          if (created) {
            notifications.show({
              title: 'Protocolo creado',
              message: 'El protocolo ha sido creado con éxito',
              intent: 'success',
            })

            localStorage.removeItem('temp-protocol')

            return startTransition(() => {
              router.push(`/protocols/${created.id}`)
            })
          }
          return notifications.show({
            title: 'Error al crear',
            message: 'Hubo un error al crear el protocolo',
            intent: 'error',
          })
        } catch (error) {
          console.error('Error creating protocol:', error)
          return notifications.show({
            title: 'Error al crear',
            message:
              'Hubo un error al crear el protocolo. Por favor, verifica que todos los campos requeridos estén completos.',
            intent: 'error',
          })
        }
      }

      const updated = await updateProtocolById(id, restOfProtocol as Protocol)

      if (updated) {
        notifications.show({
          title: 'Protocolo guardado',
          message: 'El protocolo ha sido guardado con éxito',
          intent: 'success',
        })
        return startTransition(() => {
          router.push(`/protocols/${protocol.id}`)
        })
      }
      return notifications.show({
        title: 'Error al guardar',
        message: 'Hubo un error al guardar el protocolo',
        intent: 'error',
      })
    },
    [router]
  )

  const SectionButton = useCallback(
    ({
      path,
      label,
      value,
    }: {
      path: string
      label: string
      value: string
    }) => (
      <BadgeButton
        color="light"
        className={cx(
          'opacity-70',
          section == value && 'font-semibold opacity-100'
        )}
        onClick={() => {
          startTransition(() => {
            setSection(value)
          })
        }}
      >
        {label}

        {!form.isValid(path) ?
          form.isDirty(path) ?
            <AlertCircle className="size-4 stroke-yellow-500" />
            : <CircleDashed className="size-3.5 stroke-gray-500" />
          : <CircleCheck className="size-4 stroke-teal-500" />}
      </BadgeButton>
    ),
    [form, section]
  )

  const activeSection = sections.find((s) => s.key === section) ?? sections[0]
  const sectionIndex = sections.findIndex((s) => s.key === section)
  const isFirst = sectionIndex <= 0
  const isLast = sectionIndex >= sections.length - 1
  const isTeacherThesis = form.values.protocolType === 'TEACHER_THESIS'

  return (
    <ProtocolProvider form={form}>
      <form
        onBlur={() => {
          pathname?.split('/')[2] === 'new' && typeof window !== 'undefined' ?
            localStorage.setItem('temp-protocol', JSON.stringify(form.values))
            : null
        }}
        onSubmit={(e) => {
          e.preventDefault()

          // Identification draft validation only applies to standard protocols.
          // TT uses a different identification shape (no team/academic-units/etc.).
          if (!isTeacherThesis) {
            try {
              IdentificationDraftSchema.parse(
                form.values.sections.identification
              )
            } catch (error: any) {
              const errorMessage =
                error.errors?.[0]?.message ||
                'Hay errores en la sección de identificación'
              notifications.show({
                title: 'No se pudo guardar',
                message: errorMessage,
                intent: 'error',
              })
              return form.validate()
            }
          }

          const sanitizedValues = {
            ...form.values,
            sections: {
              ...form.values.sections,
              identification: {
                ...form.values.sections.identification!,
                careerId: sanitizeObjectId(
                  form.values.sections.identification!.careerId
                ),
                courseId: sanitizeObjectId(
                  form.values.sections.identification!.courseId
                ),
              },
            },
          }

          upsertProtocol(sanitizedValues as any)
        }}
      >
        <InfoTooltip>
          <h4>Indicadores de sección</h4>
          <p>
            <CircleCheck className="mr-2 inline h-4 w-4 stroke-teal-500 stroke-2" />
            Indica que la sección se encuentra completada y sin errores. Cuando
            todas las secciones tengan este indicador, se permite publicar un
            protocolo.
          </p>
          <p>
            <AlertCircle className="mr-2 inline h-4 w-4 stroke-yellow-500 stroke-2" />
            Indica que la sección fue modificada pero necesita ser completada
            correctamente, falta algún campo obligatorio o tiene algún error.
          </p>
          <p>
            <CircleDashed className="mr-2 inline h-4 w-4 stroke-gray-500 opacity-40" />
            Si la sección se encuentra con menor opacidad, es porque no fue
            modificada en la session activa, pero se encuentra incompleta.
          </p>
        </InfoTooltip>
        <motion.div
          initial={{ opacity: 0, y: -7 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mx-auto mt-2 flex w-fit flex-wrap items-center justify-center gap-0.5 rounded-lg border border-black/5 p-0.5 dark:border-white/5"
        >
          {sections.map((s) => (
            <SectionButton
              key={s.key}
              path={s.path}
              label={s.label}
              value={s.key}
            />
          ))}
        </motion.div>

        {activeSection.render()}

        <div className="mt-12 flex w-full justify-between">
          <Button
            type="button"
            plain
            disabled={isFirst}
            onClick={() => setSection(sections[sectionIndex - 1]?.key ?? '0')}
          >
            <ArrowNarrowLeft data-slot="icon" />
            Sección previa
          </Button>
          <div className="flex items-center gap-2">
            <SubmitButton isLoading={isPending}>Guardar</SubmitButton>{' '}
            <ClearLocalStorageButton />
          </div>
          <Button
            type="button"
            plain
            disabled={isLast}
            onClick={() => setSection(sections[sectionIndex + 1]?.key ?? sections[sections.length - 1].key)}
          >
            Sección siguiente
            <ArrowNarrowRight data-slot="icon" />
          </Button>
        </div>
      </form>
    </ProtocolProvider>
  )
}
