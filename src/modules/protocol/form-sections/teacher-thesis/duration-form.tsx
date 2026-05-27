'use client'

import { Button } from '@components/button'
import { FieldGroup, Fieldset, Legend } from '@components/fieldset'
import { Text } from '@components/text'
import { useProtocolContext } from '@utils/createContext'
import { DURATION_MONTHS } from '@utils/protocol-types'
import { FormInput } from '@shared/form/form-input'
import { FormListbox } from '@shared/form/form-listbox'
import { motion } from 'framer-motion'
import { Plus, Trash } from 'tabler-icons-react'

const dictToOptions = (d: Record<string, { code: string; label: string }>) =>
  Object.values(d).map((o) => ({ value: o.code, label: o.label }))

export function TtDurationForm() {
  const form = useProtocolContext()
  const duration = form.values.sections.teacherThesis!.duration

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
    >
      <Fieldset>
        <Legend>Duración del proyecto</Legend>
        <FieldGroup>
          <FormListbox
            label="Duración"
            options={dictToOptions(DURATION_MONTHS)}
            {...form.getInputProps('sections.teacherThesis.duration.durationMonths')}
          />
        </FieldGroup>
      </Fieldset>

      <Fieldset className="mt-6">
        <Legend>Cronograma de tareas</Legend>
        <Text className="!text-xs">
          Detalle las actividades por semestre (mínimo 2, máximo 10).
        </Text>
        <FieldGroup>
          {duration.schedule.map((entry: any, sIndex: number) => (
            <div
              key={sIndex}
              className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <div className="mb-2 flex items-center justify-between">
                <Text className="!text-sm font-medium">
                  {entry.semester}.° semestre
                </Text>
                {duration.schedule.length > 2 && (
                  <Button
                    plain
                    onClick={() => {
                      form.removeListItem(
                        'sections.teacherThesis.duration.schedule',
                        sIndex
                      )
                      // Renumber remaining semesters
                      const next = form.values.sections.teacherThesis!.duration.schedule
                      next.forEach((e: any, i: number) => {
                        form.setFieldValue(
                          `sections.teacherThesis.duration.schedule.${i}.semester`,
                          i + 1
                        )
                      })
                    }}
                  >
                    <Trash data-slot="icon" />
                  </Button>
                )}
              </div>
              <FieldGroup>
                {entry.activities.map((_: string, aIndex: number) => (
                  <div
                    key={aIndex}
                    className="grid items-end gap-2 sm:grid-cols-[1fr,3rem]"
                  >
                    <FormInput
                      label={aIndex === 0 ? 'Actividad' : undefined}
                      {...form.getInputProps(
                        `sections.teacherThesis.duration.schedule.${sIndex}.activities.${aIndex}`
                      )}
                    />
                    <Button
                      plain
                      onClick={() =>
                        form.removeListItem(
                          `sections.teacherThesis.duration.schedule.${sIndex}.activities`,
                          aIndex
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
                      `sections.teacherThesis.duration.schedule.${sIndex}.activities`,
                      ''
                    )
                  }
                >
                  <Plus data-slot="icon" />
                  Agregar actividad
                </Button>
              </FieldGroup>
            </div>
          ))}
          {duration.schedule.length < 10 && (
            <Button
              plain
              onClick={() =>
                form.insertListItem(
                  'sections.teacherThesis.duration.schedule',
                  { semester: duration.schedule.length + 1, activities: [] }
                )
              }
            >
              <Plus data-slot="icon" />
              Agregar semestre
            </Button>
          )}
        </FieldGroup>
      </Fieldset>
    </motion.div>
  )
}
