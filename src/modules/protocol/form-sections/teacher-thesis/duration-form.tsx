'use client'

import { Button } from '@components/button'
import { FieldGroup, Fieldset, Legend } from '@components/fieldset'
import { Text } from '@components/text'
import { useProtocolContext } from '@utils/createContext'
import type { DurationMonths } from '@utils/protocol-types'
import { DURATION_MONTHS } from '@utils/protocol-types'
import { FormInput } from '@shared/form/form-input'
import { FormListbox } from '@shared/form/form-listbox'
import { motion } from 'framer-motion'
import { Plus, Trash } from 'tabler-icons-react'

const dictToOptions = (d: Record<string, { code: string; label: string }>) =>
  Object.values(d).map((o) => ({ value: o.code, label: o.label }))

const SEMESTERS_BY_DURATION: Record<DurationMonths, number> = {
  TWELVE: 2,
  TWENTY_FOUR: 4,
}

export function TtDurationForm() {
  const form = useProtocolContext()
  const duration = form.values.sections.teacherThesis!.duration
  const durationProps = form.getInputProps(
    'sections.teacherThesis.duration.durationMonths'
  )

  // Same behavior as the standard protocol: picking the duration generates
  // the chronogram semesters automatically. Activities already entered are
  // kept when they still fit in the new duration.
  const regenerateSchedule = (months: DurationMonths) => {
    const semesters = SEMESTERS_BY_DURATION[months]
    if (!semesters) return
    const current = form.values.sections.teacherThesis!.duration.schedule
    form.setFieldValue(
      'sections.teacherThesis.duration.schedule',
      Array.from({ length: semesters }, (_, i) => ({
        semester: i + 1,
        activities: current[i]?.activities ?? [],
      }))
    )
  }

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
            {...durationProps}
            onChange={(value: unknown) => {
              // The listbox passes the option's value (the enum code) at runtime.
              const months = value as DurationMonths
              durationProps.onChange(months)
              regenerateSchedule(months)
            }}
          />
        </FieldGroup>
      </Fieldset>

      <Fieldset className="mt-6">
        <Legend>Cronograma de tareas</Legend>
        <Text className="!text-xs">
          Los semestres se generan según la duración elegida. Detalle las
          actividades de cada semestre.
        </Text>
        <FieldGroup>
          {duration.schedule.map((entry: any, sIndex: number) => (
            <div
              key={sIndex}
              className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <Text className="mb-2 !text-sm font-medium">
                {entry.semester}.° semestre
              </Text>
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
        </FieldGroup>
      </Fieldset>
    </motion.div>
  )
}
