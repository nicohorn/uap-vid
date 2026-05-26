'use client'

import { FieldGroup, Fieldset, Legend } from '@components/fieldset'
import { Text } from '@components/text'
import { FormTextarea } from '@shared/form/form-textarea'
import { useProtocolContext } from '@utils/createContext'
import { motion } from 'framer-motion'
import { useState } from 'react'

type MethodKind = 'EMPIRICAL' | 'THEORETICAL'

export function TtMethodForm() {
  const form = useProtocolContext()
  const method = form.values.sections.teacherThesis!.method
  const initialKind: MethodKind =
    method.theoreticalMethodology?.trim() ? 'THEORETICAL' : 'EMPIRICAL'
  const [kind, setKind] = useState<MethodKind>(initialKind)

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
    >
      <Fieldset>
        <Legend>Método</Legend>
        <Text className="!text-xs">
          Elija el tipo de investigación y complete los campos correspondientes.
        </Text>
        <div className="my-3 inline-flex gap-1 rounded-lg border border-gray-200 p-1 dark:border-gray-700">
          <button
            type="button"
            className={`rounded px-3 py-1 text-sm ${
              kind === 'EMPIRICAL'
                ? 'bg-primary-950 text-white dark:bg-primary-700'
                : 'text-gray-700 dark:text-gray-200'
            }`}
            onClick={() => setKind('EMPIRICAL')}
          >
            Cuantitativa / cualitativa / mixta
          </button>
          <button
            type="button"
            className={`rounded px-3 py-1 text-sm ${
              kind === 'THEORETICAL'
                ? 'bg-primary-950 text-white dark:bg-primary-700'
                : 'text-gray-700 dark:text-gray-200'
            }`}
            onClick={() => setKind('THEORETICAL')}
          >
            Teórica
          </button>
        </div>

        {kind === 'EMPIRICAL' ? (
          <FieldGroup>
            <FormTextarea
              label="Diseño o tipo de investigación"
              {...form.getInputProps('sections.teacherThesis.method.design')}
            />
            <FormTextarea
              label="Participantes (muestra y tipo de muestreo)"
              {...form.getInputProps('sections.teacherThesis.method.participants')}
            />
            <FormTextarea
              label="Lugar de desarrollo del estudio"
              {...form.getInputProps('sections.teacherThesis.method.location')}
            />
            <FormTextarea
              label="Instrumentos para la recolección de datos"
              {...form.getInputProps(
                'sections.teacherThesis.method.dataCollectionInstruments'
              )}
            />
            <FormTextarea
              label="Procedimientos para la recolección de datos"
              {...form.getInputProps(
                'sections.teacherThesis.method.dataCollectionProcedures'
              )}
            />
            <FormTextarea
              label="Procesamiento y análisis de datos"
              {...form.getInputProps('sections.teacherThesis.method.dataAnalysis')}
            />
            <FormTextarea
              label="Consideraciones éticas del estudio"
              {...form.getInputProps(
                'sections.teacherThesis.method.ethicalConsiderations'
              )}
            />
            <FormTextarea
              label="Grado de avance del Comité de Ética en Investigación"
              {...form.getInputProps(
                'sections.teacherThesis.method.ethicsCommitteeStatus'
              )}
            />
          </FieldGroup>
        ) : (
          <FieldGroup>
            <FormTextarea
              label="Metodología teórica"
              description="Detalle la metodología que se utilizará para la concreción del estudio."
              rows={8}
              {...form.getInputProps(
                'sections.teacherThesis.method.theoreticalMethodology'
              )}
            />
          </FieldGroup>
        )}
      </Fieldset>
    </motion.div>
  )
}
