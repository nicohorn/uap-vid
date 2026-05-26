'use client'

import { FieldGroup, Fieldset, Legend } from '@components/fieldset'
import { Text } from '@components/text'
import { FormTitapTextarea } from '@shared/form/form-tiptap-textarea'
import { useProtocolContext } from '@utils/createContext'
import { motion } from 'framer-motion'

export function TtIntroductionForm() {
  const form = useProtocolContext()

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
    >
      <Fieldset>
        <Legend>Introducción</Legend>
        <Text className="!text-xs">
          Se recomienda que la introducción no supere el 25 % de la extensión
          del anteproyecto completo.
        </Text>
        <FieldGroup>
          <FormTitapTextarea
            label="Estado actual del tema y principales antecedentes en la literatura"
            {...form.getInputProps('sections.teacherThesis.introduction.stateOfTheArt')}
          />
          <FormTitapTextarea
            label="Justificación científica, académico-institucional y social"
            {...form.getInputProps('sections.teacherThesis.introduction.justification')}
          />
          <FormTitapTextarea
            label="Definición del problema"
            {...form.getInputProps('sections.teacherThesis.introduction.problemDefinition')}
          />
          <FormTitapTextarea
            label="Objetivos"
            {...form.getInputProps('sections.teacherThesis.introduction.objectives')}
          />
        </FieldGroup>
      </Fieldset>
    </motion.div>
  )
}
