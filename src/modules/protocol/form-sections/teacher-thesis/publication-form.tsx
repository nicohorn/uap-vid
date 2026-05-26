'use client'

import { FieldGroup, Fieldset, Legend } from '@components/fieldset'
import { useProtocolContext } from '@utils/createContext'
import { PUBLICATION_TYPES } from '@utils/protocol-types'
import { FormListbox } from '@shared/form/form-listbox'
import { FormTitapTextarea } from '@shared/form/form-tiptap-textarea'
import { motion } from 'framer-motion'

const publicationOptions = Object.values(PUBLICATION_TYPES).map((o) => ({
  value: o.code,
  label: o.label,
}))

export function TtPublicationForm() {
  const form = useProtocolContext()

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
    >
      <Fieldset>
        <Legend>Publicación científica</Legend>
        <FieldGroup>
          <FormListbox
            label="Tipo de publicación prevista"
            options={publicationOptions}
            {...form.getInputProps('sections.teacherThesis.publication.publicationType')}
          />
          <FormTitapTextarea
            label="Plan de publicación"
            description="Presente un plan viable para la publicación de la investigación."
            {...form.getInputProps('sections.teacherThesis.publication.publicationPlan')}
          />
        </FieldGroup>
      </Fieldset>
    </motion.div>
  )
}
