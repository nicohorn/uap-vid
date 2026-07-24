'use client'

import { Button } from '@components/button'
import { ErrorMessage } from '@components/fieldset'
import { Text } from '@components/text'
import { useState } from 'react'
import { Plus, X } from 'tabler-icons-react'

// Shared keyword-chip input so the standard protocol and the teacher-thesis
// protocol collect "palabras clave" with the same interaction.
export function FormKeywordsInput({
  label = 'Palabras clave',
  description,
  keywords,
  onChange,
  error,
}: {
  label?: string
  description?: string
  keywords: string[]
  onChange: (next: string[]) => void
  error?: React.ReactNode
}) {
  const [draft, setDraft] = useState('')

  const addDraft = () => {
    const trimmed = draft.trim()
    if (trimmed && !keywords.includes(trimmed)) {
      onChange([...keywords, trimmed])
      setDraft('')
    }
  }

  return (
    <div>
      <Text className="!text-sm font-medium">{label}</Text>
      {description && <Text className="!text-xs">{description}</Text>}
      <div className="mt-2 flex flex-wrap gap-2">
        {keywords.map((kw, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-900 dark:bg-primary-900 dark:text-primary-100"
          >
            {kw}
            <button
              type="button"
              onClick={() => onChange(keywords.filter((_, j) => j !== i))}
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
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addDraft()
            }
          }}
        />
        <Button plain type="button" onClick={addDraft}>
          <Plus data-slot="icon" />
          Agregar
        </Button>
      </div>
      {error && <ErrorMessage className="mt-1">{error}</ErrorMessage>}
    </div>
  )
}
