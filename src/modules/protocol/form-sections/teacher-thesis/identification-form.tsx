'use client'

import { Button } from '@components/button'
import { FieldGroup, Fieldset, Legend } from '@components/fieldset'
import { Text } from '@components/text'
import { useProtocolContext } from '@utils/createContext'
import {
  POSTGRADUATE_PROGRAMS,
  PROTOCOL_SUBTYPES,
  PROTOCOL_TYPES,
  SPONSORING_FACULTIES,
} from '@utils/protocol-types'
import { FormInput } from '@shared/form/form-input'
import { FormListbox } from '@shared/form/form-listbox'
import { motion } from 'framer-motion'
import { Plus, Trash } from 'tabler-icons-react'

const dictToOptions = (d: Record<string, { code: string; label: string; description?: string }>) =>
  Object.values(d).map((o) => ({
    value: o.code,
    label: o.label,
    description: o.description,
  }))

export function TtIdentificationForm() {
  const form = useProtocolContext()
  const tt = form.values.sections.teacherThesis!.identification

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
    >
      <Fieldset>
        <Legend>Identificación del proyecto</Legend>
        <FieldGroup className="grid gap-3 sm:grid-cols-2">
          <FormListbox
            label="Tipo de protocolo"
            description="Determina la estructura del formulario y el flujo de aprobación."
            options={dictToOptions(PROTOCOL_TYPES)}
            {...form.getInputProps('protocolType')}
          />
          <FormListbox
            label="Subtipo"
            options={dictToOptions(PROTOCOL_SUBTYPES)}
            {...form.getInputProps('protocolSubtype')}
          />
          <FormInput
            label="Título del proyecto"
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

      <Fieldset className="mt-6">
        <Legend>Otros integrantes del equipo</Legend>
        <Text className="!text-xs">
          Agregue codirectores u otros colaboradores del equipo de investigación.
        </Text>
        <FieldGroup>
          {tt.additionalMembers.map((_: any, index: number) => (
            <div
              key={index}
              className="grid items-end gap-2 sm:grid-cols-[1fr,1fr,8rem,3rem]"
            >
              <FormInput
                label={index === 0 ? 'Nombre completo' : undefined}
                {...form.getInputProps(
                  `sections.teacherThesis.identification.additionalMembers.${index}.name`
                )}
              />
              <FormInput
                label={index === 0 ? 'Rol' : undefined}
                {...form.getInputProps(
                  `sections.teacherThesis.identification.additionalMembers.${index}.role`
                )}
              />
              <FormInput
                label={index === 0 ? 'Horas semanales' : undefined}
                type="number"
                {...form.getInputProps(
                  `sections.teacherThesis.identification.additionalMembers.${index}.weeklyHours`
                )}
              />
              <Button
                plain
                onClick={() =>
                  form.removeListItem(
                    'sections.teacherThesis.identification.additionalMembers',
                    index
                  )
                }
              >
                <Trash data-slot="icon" />
              </Button>
            </div>
          ))}
          <Button
            plain
            onClick={() =>
              form.insertListItem(
                'sections.teacherThesis.identification.additionalMembers',
                { name: '', role: '', weeklyHours: 0 }
              )
            }
          >
            <Plus data-slot="icon" />
            Agregar integrante
          </Button>
        </FieldGroup>
      </Fieldset>

      <Fieldset className="mt-6">
        <Legend>Especialistas elegibles para evaluadores</Legend>
        <Text className="!text-xs">
          Listado de especialistas del área propuestos por el investigador
          responsable. La designación final estará a cargo del secretario de
          investigación de la unidad académica.
        </Text>
        <FieldGroup>
          {tt.eligibleEvaluators.map((_: string, index: number) => (
            <div
              key={index}
              className="grid items-end gap-2 sm:grid-cols-[1fr,3rem]"
            >
              <FormInput
                label={index === 0 ? 'Nombre y filiación' : undefined}
                {...form.getInputProps(
                  `sections.teacherThesis.identification.eligibleEvaluators.${index}`
                )}
              />
              <Button
                plain
                onClick={() =>
                  form.removeListItem(
                    'sections.teacherThesis.identification.eligibleEvaluators',
                    index
                  )
                }
              >
                <Trash data-slot="icon" />
              </Button>
            </div>
          ))}
          <Button
            plain
            onClick={() =>
              form.insertListItem(
                'sections.teacherThesis.identification.eligibleEvaluators',
                ''
              )
            }
          >
            <Plus data-slot="icon" />
            Agregar especialista
          </Button>
        </FieldGroup>
      </Fieldset>
    </motion.div>
  )
}
