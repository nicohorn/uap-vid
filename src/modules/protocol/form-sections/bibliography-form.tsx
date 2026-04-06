'use client'
import { motion } from 'framer-motion'
import { useProtocolContext } from '@utils/createContext'
import { Plus, Trash } from 'tabler-icons-react'
import {
  Field,
  Fieldset,
  Label,
  Legend,
} from '@components/fieldset'
import { FormInput } from '@shared/form/form-input'
import { Fragment } from 'react'
import { Button } from '@components/button'

export function BibliographyForm() {
  const form = useProtocolContext()

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
    >
      <Fieldset>
        <Legend>Bibliografía</Legend>
        <div className="mt-2 grid grid-cols-[repeat(26,minmax(0,1fr))] gap-1">
          <Field className="col-span-5">
            <Label>Autor</Label>
          </Field>
          <Field className="col-span-9">
            <Label>Título</Label>
          </Field>
          <Field className="col-span-3">
            <Label>Año de publicación</Label>
          </Field>
          <Field className="col-span-8">
            <Label>URL</Label>
          </Field>
          <span />
          {form.values.sections.bibliography.chart.map((_, index) => (
            <Fragment key={index}>
              <FormInput
                className="col-span-5"
                label=""
                {...form.getInputProps(
                  `sections.bibliography.chart.${index}.author`
                )}
              />

              <FormInput
                className="col-span-9"
                label=""
                {...form.getInputProps(
                  `sections.bibliography.chart.${index}.title`
                )}
              />

              <FormInput
                className="col-span-3"
                label=""
                type="number"
                {...form.getInputProps(
                  `sections.bibliography.chart.${index}.year`
                )}
              />

              <FormInput
                className="col-span-8"
                label=""
                {...form.getInputProps(
                  `sections.bibliography.chart.${index}.url`
                )}
              />

              {index === 0 ?
                <span />
              : <Button plain className="mt-1 self-start">
                  <Trash
                    data-slot="icon"
                    onClick={() =>
                      form.removeListItem(`sections.bibliography.chart`, index)
                    }
                  />
                </Button>
              }
            </Fragment>
          ))}
        </div>

        <Button
          plain
          onClick={() => {
            form.insertListItem(`sections.bibliography.chart`, {
              author: '',
              title: '',
              year: 0,
              url: '',
            })

            setTimeout(() => {
              document
                .getElementById(
                  `row-${form.values.sections.bibliography.chart.length}`
                )
                ?.getElementsByTagName('input')[0]
                .focus()
            }, 10)
          }}
          className="my-1"
        >
          <Plus data-slot="icon" />
          Añadir otra publicación
        </Button>
      </Fieldset>
    </motion.div>
  )
}
