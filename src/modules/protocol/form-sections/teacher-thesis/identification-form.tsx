'use client'

import { FieldGroup, Fieldset, Legend } from '@components/fieldset'
import { useProtocolContext } from '@utils/createContext'
import {
  POSTGRADUATE_PROGRAMS,
  SPONSORING_FACULTIES,
} from '@utils/protocol-types'
import { FormInput } from '@shared/form/form-input'
import { FormListbox } from '@shared/form/form-listbox'
import { motion } from 'framer-motion'

const dictToOptions = (d: Record<string, { code: string; label: string; description?: string }>) =>
  Object.values(d).map((o) => ({
    value: o.code,
    label: o.label,
    description: o.description,
  }))

export function TtIdentificationForm() {
  const form = useProtocolContext()

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
          <FormListbox
            label="Carrera de posgrado"
            options={dictToOptions(POSTGRADUATE_PROGRAMS)}
            {...form.getInputProps('sections.teacherThesis.identification.postgraduateProgram')}
          />
          <FormInput
            label="Tipo de tesis"
            {...form.getInputProps('sections.teacherThesis.identification.thesisType')}
          />
          <FormListbox
            label="Ente patrocinante"
            description="Facultad que avala el proyecto."
            options={dictToOptions(SPONSORING_FACULTIES)}
            className="sm:col-span-2"
            {...form.getInputProps('sections.teacherThesis.identification.sponsoringFaculty')}
          />
        </FieldGroup>
      </Fieldset>

      <Fieldset className="mt-6">
        <Legend>Tesista y director</Legend>
        <FieldGroup className="grid gap-3 sm:grid-cols-[1fr,1fr,8rem]">
          <FormInput
            label="Tesista (nombre completo)"
            {...form.getInputProps('sections.teacherThesis.identification.thesisCandidate.name')}
          />
          <FormInput
            label="Rol"
            {...form.getInputProps('sections.teacherThesis.identification.thesisCandidate.role')}
          />
          <FormInput
            label="Horas semanales"
            type="number"
            {...form.getInputProps('sections.teacherThesis.identification.thesisCandidate.weeklyHours')}
          />
          <FormInput
            label="Director (nombre completo)"
            {...form.getInputProps('sections.teacherThesis.identification.director.name')}
          />
          <FormInput
            label="Rol"
            {...form.getInputProps('sections.teacherThesis.identification.director.role')}
          />
          <FormInput
            label="Horas semanales"
            type="number"
            {...form.getInputProps('sections.teacherThesis.identification.director.weeklyHours')}
          />
        </FieldGroup>
      </Fieldset>
    </motion.div>
  )
}
