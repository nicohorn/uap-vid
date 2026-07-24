'use client'
import { useProtocolContext } from 'utils/createContext'
import { motion } from 'framer-motion'
import { useEffect } from 'react'

import { FormTitapTextarea } from '@shared/form/form-tiptap-textarea'
import { FormListbox } from '@shared/form/form-listbox'
import { FormCheckbox } from '@shared/form/form-checkbox'
import { FieldGroup, Fieldset, Legend } from '@components/fieldset'
import { FormCombobox } from '@shared/form/form-combobox'
import { FormKeywordsInput } from '@shared/form/form-keywords-input'
import { DISCIPLINES, linesForDiscipline } from '@utils/disciplines'
import {
  methodologyTypeForApproach,
  QUANTITATIVE_QUALITATIVE_METHODOLOGY_TYPE,
  THEORETICAL_METHODOLOGY_TYPE,
} from '@utils/methodology'
import {
  FieldInfo,
  ObjectiveInfo,
  TypeInfo,
} from './description-tooltips'

export function DescriptionForm() {
  const form = useProtocolContext()

  const approach = form.values.sections.description?.methodologicalApproach
  // The approach dropdown drives the branch; protocols saved before the
  // dropdowns existed fall back to their stored methodology type so their
  // fields stay editable.
  const methodologyType =
    methodologyTypeForApproach(approach) ||
    form.values.sections.methodology?.type

  // Keep the legacy methodology.type in sync with the approach dropdown so
  // the stored data keeps the same shape as protocols created when
  // methodology was its own tab. Old protocols keep their saved type until
  // the researcher picks an approach.
  useEffect(() => {
    if (!approach || !form.values.sections.methodology) return
    const derived = methodologyTypeForApproach(approach)
    if (form.values.sections.methodology.type !== derived)
      form.setFieldValue('sections.methodology.type', derived)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approach])

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
          {/* Stored as a comma-separated string (legacy shape) but edited
              with the same chip input the teacher-thesis form uses. */}
          <FormKeywordsInput
            keywords={(form.values.sections.description?.words ?? '')
              .split(',')
              .map((w: string) => w.trim())
              .filter(Boolean)}
            error={form.getInputProps('sections.description.words').error}
            onChange={(next) =>
              form.setFieldValue('sections.description.words', next.join(', '))
            }
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

      {/* Methodology detail moved here from the removed Metodología tab.
          The branch mirrors the old form's two types, now driven by the
          approach dropdown. */}
      {methodologyType ?
        <Fieldset className="mt-8">
          <Legend>Metodología</Legend>
          <FieldGroup>
            {methodologyType === THEORETICAL_METHODOLOGY_TYPE && (
              <TheoreticalMethodology />
            )}
            {methodologyType === QUANTITATIVE_QUALITATIVE_METHODOLOGY_TYPE && (
              <QuantitativeQualitativeMethodology />
            )}
          </FieldGroup>
        </Fieldset>
      : null}
    </motion.div>
  )
}

const QuantitativeQualitativeMethodology = () => {
  const form = useProtocolContext()
  return (
    <>
      <FormTitapTextarea
        label="Diseño"
        description="Describa el diseño y el tipo de investigación"
        {...form.getInputProps('sections.methodology.design')}
      />
      <FormTitapTextarea
        label="Participantes"
        description="Participantes en la metodología del proyecto"
        {...form.getInputProps('sections.methodology.participants')}
      />
      <FormTitapTextarea
        label="Lugar"
        description="El lugar donde se llevará a cabo el desarrollo de la investigación"
        {...form.getInputProps('sections.methodology.place')}
      />
      <FormTitapTextarea
        label="Análisis de datos"
        description="Describa brevemente el proceso de análisis de los datos"
        {...form.getInputProps('sections.methodology.analysis')}
      />
      <FormCheckbox
        label="Procedimientos especiales"
        description="Proyecto con procedimientos en humanos, animales o en base de datos"
        {...form.getInputProps('sections.methodology.humanAnimalOrDb', {
          type: 'checkbox',
        })}
      />

      {form.values.sections.methodology!.humanAnimalOrDb && (
        <>
          <FormTitapTextarea
            label="Procedimientos de recolección"
            description="Qué procedimientos se utilizarán para la recolección de datos"
            {...form.getInputProps('sections.methodology.procedures')}
          />
          <FormTitapTextarea
            label="Instrumentos de recolección"
            description="Los instrumentos que se utilizarán para la recolección de datos"
            {...form.getInputProps('sections.methodology.instruments')}
          />
          <FormTitapTextarea
            label="Consideraciones éticas"
            description="Describa brevemente las consideraciones éticas a tener en cuenta"
            {...form.getInputProps('sections.methodology.considerations')}
          />
        </>
      )}
    </>
  )
}

const TheoreticalMethodology = () => {
  const form = useProtocolContext()
  return (
    <FormTitapTextarea
      label="Detalle de metodología"
      {...form.getInputProps('sections.methodology.detail')}
    />
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
  'Producción general de conocimiento',
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
