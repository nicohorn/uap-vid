'use client'

import { FieldGroup, Fieldset, Legend } from '@components/fieldset'
import { useProtocolContext } from '@utils/createContext'
import { DISCIPLINES, linesForDiscipline } from '@utils/disciplines'
import {
  APPLICATION_FIELDS,
  RESEARCH_TYPES,
  SOCIOECONOMIC_OBJECTIVES,
} from '@utils/protocol-types'
import { FormCombobox } from '@shared/form/form-combobox'
import { FormKeywordsInput } from '@shared/form/form-keywords-input'
import { FormListbox } from '@shared/form/form-listbox'
import { FormTextarea } from '@shared/form/form-textarea'
import { motion } from 'framer-motion'
import {
  FieldInfo,
  ObjectiveInfo,
  TypeInfo,
} from '../description-tooltips'

const dictToOptions = (d: Record<string, { code: string; label: string; description?: string }>) =>
  Object.values(d).map((o) => ({
    value: o.code,
    label: o.label,
    description: o.description,
  }))

const countWords = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

export function TtDescriptionForm() {
  const form = useProtocolContext()
  const description = form.values.sections.teacherThesis!.description
  const abstractWords = countWords(description.technicalAbstract || '')

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
            {...form.getInputProps(
              'sections.teacherThesis.description.generalDiscipline'
            )}
            onBlur={() => {
              form.setFieldValue(
                'sections.teacherThesis.description.researchLine',
                ''
              )
            }}
          />
          <FormCombobox
            label="Línea de investigación"
            options={linesForDiscipline(description.generalDiscipline).map(
              (e) => ({ value: e, label: e })
            )}
            disabled={!description.generalDiscipline}
            {...form.getInputProps(
              'sections.teacherThesis.description.researchLine'
            )}
          />
          <div>
            <FormTextarea
              label="Resumen técnico"
              description={`Entre 150 y 250 palabras (actual: ${abstractWords}).`}
              rows={6}
              {...form.getInputProps('sections.teacherThesis.description.technicalAbstract')}
            />
          </div>

          <FormKeywordsInput
            description="Entre 4 y 6 descriptores temáticos relevantes."
            keywords={description.keywords}
            error={
              form.getInputProps('sections.teacherThesis.description.keywords')
                .error
            }
            onChange={(next) =>
              form.setFieldValue(
                'sections.teacherThesis.description.keywords',
                next
              )
            }
          />

          <FieldInfo />
          <FormListbox
            label="Campo de aplicación"
            options={dictToOptions(APPLICATION_FIELDS)}
            {...form.getInputProps('sections.teacherThesis.description.applicationField')}
          />
          <ObjectiveInfo />
          <FormListbox
            label="Objetivo socioeconómico"
            options={dictToOptions(SOCIOECONOMIC_OBJECTIVES)}
            {...form.getInputProps('sections.teacherThesis.description.socioeconomicObjective')}
          />
          <TypeInfo />
          <FormListbox
            label="Tipo de investigación"
            options={dictToOptions(RESEARCH_TYPES)}
            {...form.getInputProps('sections.teacherThesis.description.researchType')}
          />
        </FieldGroup>
      </Fieldset>
    </motion.div>
  )
}
