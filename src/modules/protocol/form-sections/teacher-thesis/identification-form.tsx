'use client'

import { Button } from '@components/button'
import { FieldGroup, Fieldset, Legend } from '@components/fieldset'
import { useProtocolContext } from '@utils/createContext'
import {
  SPONSORING_FACULTIES,
  THESIS_TYPES,
} from '@utils/protocol-types'
import { FormCombobox } from '@shared/form/form-combobox'
import { FormInput } from '@shared/form/form-input'
import { FormListbox } from '@shared/form/form-listbox'
import { getAllTeamMembers } from '@repositories/team-member'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Edit } from 'tabler-icons-react'

const dictToOptions = (d: Record<string, { code: string; label: string; description?: string }>) =>
  Object.values(d).map((o) => ({
    value: o.code,
    label: o.label,
    description: o.description,
  }))

// Tesista and Director rows share the same structure: a member linked to the
// system (or entered manually as a fallback), a fixed role and weekly hours.
function TtTeamMemberRow({
  basePath,
  memberLabel,
  teamMembers,
}: {
  basePath: string
  memberLabel: string
  teamMembers: { id: string; name: string }[] | undefined
}) {
  const form = useProtocolContext()
  const [manualInput, setManualInput] = useState(false)

  const memberIdProps = form.getInputProps(`${basePath}.teamMemberId`)
  const nameProps = form.getInputProps(`${basePath}.name`)

  return (
    <>
      <div className="flex items-end gap-1">
        {manualInput ?
          <FormInput
            className="flex-1"
            label={`${memberLabel} (nombre completo)`}
            placeholder="Nombre completo"
            {...nameProps}
          />
        : <FormCombobox
            className="flex-1"
            label={memberLabel}
            placeholder="Seleccione un miembro"
            options={
              teamMembers?.map((m) => ({ value: m.id, label: m.name })) ?? []
            }
            {...memberIdProps}
            error={memberIdProps.error || nameProps.error}
            onChange={(value: unknown) => {
              // The combobox passes the option's value (the member id) at runtime.
              const id = value as string | null
              memberIdProps.onChange(id)
              const selected = teamMembers?.find((m) => m.id === id)
              form.setFieldValue(`${basePath}.name`, selected?.name ?? '')
            }}
          />
        }
        <Button
          type="button"
          plain
          className="mb-0.5 px-2 py-1"
          title={
            manualInput ?
              'Seleccionar de la lista de miembros'
            : 'Ingresar manualmente (persona externa al sistema)'
          }
          onClick={() => {
            // Switching modes clears the link so a stale teamMemberId never
            // outlives a manually typed name.
            form.setFieldValue(`${basePath}.teamMemberId`, null)
            if (!manualInput) form.setFieldValue(`${basePath}.name`, '')
            setManualInput((v) => !v)
          }}
        >
          <Edit size={16} />
        </Button>
      </div>
      <FormInput
        label="Horas semanales"
        type="number"
        {...form.getInputProps(`${basePath}.weeklyHours`)}
      />
    </>
  )
}

export function TtIdentificationForm() {
  const form = useProtocolContext()
  const { data: teamMembers } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => await getAllTeamMembers(),
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
    >
      <Fieldset>
        <Legend>Identificación del proyecto</Legend>
        <FieldGroup className="grid gap-3 sm:grid-cols-2">
          <FormInput
            label="Título del proyecto"
            className="sm:col-span-2"
            {...form.getInputProps('sections.identification.title')}
          />
          <FormInput
            label="Año"
            type="number"
            {...form.getInputProps('sections.teacherThesis.identification.year')}
          />
          <FormInput
            label="Carrera de posgrado a la que pertenece"
            placeholder="Ej.: Maestría en Salud Pública"
            {...form.getInputProps('sections.teacherThesis.identification.postgraduateProgram')}
          />
          <FormListbox
            label="Tipo de tesis"
            options={dictToOptions(THESIS_TYPES)}
            {...form.getInputProps('sections.teacherThesis.identification.thesisType')}
          />
          <FormListbox
            label="Ente patrocinante"
            description="Facultad que avala el proyecto."
            options={dictToOptions(SPONSORING_FACULTIES)}
            {...form.getInputProps('sections.teacherThesis.identification.sponsoringFaculty')}
          />
        </FieldGroup>
      </Fieldset>

      <Fieldset className="mt-6">
        <Legend>Tesista y director</Legend>
        <FieldGroup className="grid gap-3 sm:grid-cols-[1fr,8rem]">
          <TtTeamMemberRow
            basePath="sections.teacherThesis.identification.thesisCandidate"
            memberLabel="Tesista"
            teamMembers={teamMembers ?? undefined}
          />
          <TtTeamMemberRow
            basePath="sections.teacherThesis.identification.director"
            memberLabel="Director"
            teamMembers={teamMembers ?? undefined}
          />
        </FieldGroup>
      </Fieldset>
    </motion.div>
  )
}
