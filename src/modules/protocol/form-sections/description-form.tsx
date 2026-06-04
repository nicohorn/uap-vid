'use client'
import { useProtocolContext } from 'utils/createContext'
import { motion } from 'framer-motion'

import { FormTitapTextarea } from '@shared/form/form-tiptap-textarea'
import { FormListbox } from '@shared/form/form-listbox'
import { FieldGroup, Fieldset, Legend } from '@components/fieldset'
import { FormCombobox } from '@shared/form/form-combobox'
import { FormInput } from '@shared/form/form-input'
import { DISCIPLINES, linesForDiscipline } from '@utils/disciplines'
import {
  FieldInfo,
  ObjectiveInfo,
  TypeInfo,
} from './description-tooltips'

export function DescriptionForm() {
  const form = useProtocolContext()

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
    >
      <Fieldset>
        <Legend>Descripción del proyecto</Legend>
        <FieldGroup>
          <FormListbox
            label="Área de investigación"
            options={DISCIPLINES.map((d) => ({ value: d, label: d }))}
            {...form.getInputProps('sections.description.discipline')}
            onBlur={() => {
              form.setFieldValue('sections.description.line', '')
            }}
          />
          <FormCombobox
            label="Línea de investigación"
            options={linesForDiscipline(
              form.values.sections.description!.discipline
            ).map((e) => ({ value: e, label: e }))}
            disabled={
              !form.getInputProps('sections.description.discipline').value
            }
            {...form.getInputProps('sections.description.line')}
          />
          <FormTitapTextarea
            label="Resumen técnico, con una extensión mínima de 150 palabras y máxima de 250 palabras"
            {...form.getInputProps('sections.description.technical')}
          />
          <FormInput
            label="Palabras clave"
            {...form.getInputProps('sections.description.words')}
          />
          <FieldInfo />
          <FormListbox
            label="Campo de aplicación"
            options={fields.map((e) => ({ value: e, label: e }))}
            {...form.getInputProps('sections.description.field')}
          />
          <ObjectiveInfo />
          <FormListbox
            label="Objetivo socioeconómico"
            options={objective.map((e) => ({ value: e, label: e }))}
            {...form.getInputProps('sections.description.objective')}
          />
          <TypeInfo />
          <FormListbox
            label="Tipo de investigación según el propósito"
            options={type.map((e) => ({ value: e, label: e }))}
            {...form.getInputProps('sections.description.type')}
          />
          <FormListbox
            label="Tipo de investigación según el enfoque metodológico"
            options={methodologicalApproachOptions.map((e) => ({ value: e, label: e }))}
            {...form.getInputProps('sections.description.methodologicalApproach')}
          />
          <FormListbox
            label="Tipo de investigación según el diseño metodológico"
            options={methodologicalDesignOptions.map((e) => ({ value: e, label: e }))}
            {...form.getInputProps('sections.description.methodologicalDesign')}
          />
        </FieldGroup>
      </Fieldset>
    </motion.div>
  )
}

const fields = [
  'Ciencias exactas y naturales',
  'Ingeniería y tecnología',
  'Ciencias médicas',
  'Ciencias agrícolas y veterinarias',
  'Ciencias sociales',
  'Humanidades y artes',
]

const objective = [
  'Exploración y explotación de la tierra',
  'Medio ambiente',
  'Exploración y explotación de espacio',
  'Transporte, telecomunicación y otras infraestructuras',
  'Energía',
  'Producción y tecnología industrial',
  'Salud',
  'Agricultura',
  'Educación',
  'Cultura, recreación, religión y medios de comunicación',
  'Estructuras, procesos y sistemas políticos y sociales',
]
const type = [
  'Investigación básica',
  'Investigación aplicada',
  'Investigación experimental',
]

const methodologicalApproachOptions = [
  'Cualitativa',
  'Cuantitativa',
  'Mixta',
  'Ninguna de estas',
]

const methodologicalDesignOptions = [
  'Documental',
  'De campo',
  'Experimental',
  'No experimental',
  'Ninguna de estas',
]
