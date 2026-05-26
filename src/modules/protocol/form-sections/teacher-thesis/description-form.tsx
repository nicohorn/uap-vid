'use client'

import { Button } from '@components/button'
import { FieldGroup, Fieldset, Legend } from '@components/fieldset'
import { Text } from '@components/text'
import { useProtocolContext } from '@utils/createContext'
import {
  APPLICATION_FIELDS,
  RESEARCH_TYPES,
  SOCIOECONOMIC_OBJECTIVES,
} from '@utils/protocol-types'
import { FormInput } from '@shared/form/form-input'
import { FormListbox } from '@shared/form/form-listbox'
import { FormTextarea } from '@shared/form/form-textarea'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Plus, X } from 'tabler-icons-react'

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
  const [keywordDraft, setKeywordDraft] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
    >
      <Fieldset>
        <Legend>Descripción del proyecto</Legend>
        <FieldGroup>
          <FormInput
            label="Disciplina general"
            description="Ver Anexo A"
            {...form.getInputProps('sections.teacherThesis.description.generalDiscipline')}
          />
          <FormInput
            label="Área específica del conocimiento"
            description="Ver Anexo A"
            {...form.getInputProps('sections.teacherThesis.description.specificArea')}
          />
          <FormInput
            label="Línea de investigación"
            description="Ver Anexo A"
            {...form.getInputProps('sections.teacherThesis.description.researchLine')}
          />
          <div>
            <FormTextarea
              label="Resumen técnico"
              description={`Entre 150 y 250 palabras (actual: ${abstractWords}).`}
              rows={6}
              {...form.getInputProps('sections.teacherThesis.description.technicalAbstract')}
            />
          </div>

          <div>
            <Text className="!text-sm font-medium">Palabras clave</Text>
            <Text className="!text-xs">
              Entre 4 y 6 descriptores temáticos relevantes.
            </Text>
            <div className="mt-2 flex flex-wrap gap-2">
              {description.keywords.map((kw: string, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-900 dark:bg-primary-900 dark:text-primary-100"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() =>
                      form.removeListItem(
                        'sections.teacherThesis.description.keywords',
                        i
                      )
                    }
                    aria-label="Quitar"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                className="input rounded border px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
                placeholder="Nueva palabra clave"
                value={keywordDraft}
                onChange={(e) => setKeywordDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const trimmed = keywordDraft.trim()
                    if (trimmed && !description.keywords.includes(trimmed)) {
                      form.insertListItem(
                        'sections.teacherThesis.description.keywords',
                        trimmed
                      )
                      setKeywordDraft('')
                    }
                  }
                }}
              />
              <Button
                plain
                type="button"
                onClick={() => {
                  const trimmed = keywordDraft.trim()
                  if (trimmed && !description.keywords.includes(trimmed)) {
                    form.insertListItem(
                      'sections.teacherThesis.description.keywords',
                      trimmed
                    )
                    setKeywordDraft('')
                  }
                }}
              >
                <Plus data-slot="icon" />
                Agregar
              </Button>
            </div>
          </div>

          <FormListbox
            label="Campo de aplicación"
            options={dictToOptions(APPLICATION_FIELDS)}
            {...form.getInputProps('sections.teacherThesis.description.applicationField')}
          />
          <FormListbox
            label="Objetivo socioeconómico"
            options={dictToOptions(SOCIOECONOMIC_OBJECTIVES)}
            {...form.getInputProps('sections.teacherThesis.description.socioeconomicObjective')}
          />
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
