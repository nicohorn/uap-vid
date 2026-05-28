'use client'

import { Button } from '@components/button'
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from '@components/dialog'
import { FieldGroup, Fieldset, Legend } from '@components/fieldset'
import { Text } from '@components/text'
import { FormInput } from '@shared/form/form-input'
import { useProtocolContext } from '@utils/createContext'
import { parseBibliographyText } from '@utils/bibliography'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Clipboard, Plus, Trash } from 'tabler-icons-react'

type Entry = { content: string; link: string }
const emptyEntry = (): Entry => ({ content: '', link: '' })

export function BibliographyForm() {
  const form = useProtocolContext()
  const bibliography = (form.values.sections.bibliography as any) ?? {}
  const entries: Entry[] = Array.isArray(bibliography.entries)
    ? bibliography.entries
    : []
  const [pasteOpen, setPasteOpen] = useState(false)
  const [pasteText, setPasteText] = useState('')

  // Ensure `entries` exists as an array on first mount; otherwise Mantine's
  // insertListItem silently no-ops because the path isn't an array (common
  // for drafts saved before the entries field existed, or for protocols
  // loaded with a stale Prisma client).
  useEffect(() => {
    if (!Array.isArray(bibliography.entries)) {
      form.setFieldValue('sections.bibliography.entries', [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Use setFieldValue with explicit array spread so the handler works
  // regardless of whether Mantine considers the path a list yet.
  const appendEntries = (toAdd: Entry[]) => {
    if (toAdd.length === 0) return
    const current = Array.isArray(
      form.values.sections.bibliography?.entries
    )
      ? form.values.sections.bibliography!.entries
      : []
    form.setFieldValue('sections.bibliography.entries', [
      ...(current as Entry[]),
      ...toAdd,
    ])
  }

  const removeEntry = (index: number) => {
    const current = Array.isArray(
      form.values.sections.bibliography?.entries
    )
      ? form.values.sections.bibliography!.entries
      : []
    form.setFieldValue(
      'sections.bibliography.entries',
      (current as Entry[]).filter((_, i) => i !== index)
    )
  }

  const addRow = () => appendEntries([emptyEntry()])

  const closePaste = () => {
    setPasteOpen(false)
    setPasteText('')
  }

  const importPasted = () => {
    appendEntries(parseBibliographyText(pasteText))
    closePaste()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
    >
      <Fieldset>
        <Legend>Bibliografía</Legend>
        <Text className="!text-xs">
          Cargá una cita por fila. El enlace es opcional (DOI, URL editorial,
          biblioteca, etc.).
        </Text>
        <div className="mt-3">
          <Button type="button" color="light" onClick={() => setPasteOpen(true)}>
            <Clipboard data-slot="icon" />
            Pegar bibliografía
          </Button>
        </div>
        <FieldGroup>
          {entries.length === 0 && (
            <Text className="!text-xs italic">
              Aún no hay entradas. Agregá una manualmente o pegá tu
              bibliografía.
            </Text>
          )}
          {entries.map((_: any, i: number) => (
            <div
              key={i}
              className="grid items-end gap-2 sm:grid-cols-[1fr,1fr,3rem]"
            >
              <FormInput
                label={i === 0 ? 'Cita' : undefined}
                placeholder="Apellido, N. (Año). Título. Editorial."
                {...form.getInputProps(
                  `sections.bibliography.entries.${i}.content`
                )}
              />
              <FormInput
                label={i === 0 ? 'Enlace (opcional)' : undefined}
                placeholder="https://..."
                {...form.getInputProps(
                  `sections.bibliography.entries.${i}.link`
                )}
              />
              <Button
                type="button"
                plain
                aria-label="Quitar entrada"
                onClick={() => removeEntry(i)}
              >
                <Trash data-slot="icon" />
              </Button>
            </div>
          ))}
          <div>
            <Button type="button" plain onClick={addRow}>
              <Plus data-slot="icon" />
              Añadir entrada
            </Button>
          </div>
        </FieldGroup>
      </Fieldset>

      <Dialog open={pasteOpen} onClose={closePaste} size="2xl">
        <DialogTitle>Pegar bibliografía</DialogTitle>
        <DialogDescription>
          Pegá tu bibliografía existente (una cita por línea). Detectamos
          enlaces <code>http(s)://...</code> automáticamente y los separamos
          del texto.
        </DialogDescription>
        <DialogBody>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={12}
            className="w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            placeholder={`Apellido, N. (2020). Título de la obra. Editorial. https://doi.org/...\nAutor, A. (2021). Otra obra. https://...`}
          />
        </DialogBody>
        <DialogActions>
          <Button type="button" plain onClick={closePaste}>
            Cancelar
          </Button>
          <Button type="button" onClick={importPasted}>
            Parsear y agregar
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  )
}
