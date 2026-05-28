'use client'

import { Button } from '@components/button'
import { Subheading } from '@components/heading'
import { Text } from '@components/text'
import { FormListbox } from '@shared/form/form-listbox'
import { cx } from '@utils/cx'
import {
  PROTOCOL_SUBTYPES,
  PROTOCOL_TYPES,
  type ProtocolSubtype,
  type ProtocolType,
  typeToSlug,
} from '@utils/protocol-types'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { ArrowNarrowRight, FileReport, School } from 'tabler-icons-react'

const TYPE_DESCRIPTIONS: Record<ProtocolType, string> = {
  STANDARD:
    'Formulario completo de 7 secciones (identificación, duración, presupuesto, descripción, introducción, producción y bibliografía) con flujo de evaluación metodológica y científica.',
  TEACHER_THESIS:
    'Proyecto de tesis de posgrado (maestría o doctorado). Estructura específica con secciones para tesista, director, cronograma semestral y CV. Va directamente a aprobación de VID, sin evaluación metodológica ni científica.',
}

const TYPE_ICONS: Record<ProtocolType, JSX.Element> = {
  STANDARD: <FileReport className="size-8 text-primary-700 dark:text-primary-300" />,
  TEACHER_THESIS: <School className="size-8 text-primary-700 dark:text-primary-300" />,
}

const subtypeOptions = Object.values(PROTOCOL_SUBTYPES).map((s) => ({
  value: s.code,
  label: s.label,
  description: s.description,
}))

export function ProtocolTypeCards() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<ProtocolType | null>(null)
  const [selectedSubtype, setSelectedSubtype] = useState<ProtocolSubtype | ''>('')
  const [isPending, startTransition] = useTransition()

  const handleContinue = () => {
    if (!selectedType) return
    const url = `/protocols/new/${typeToSlug(selectedType)}/0${
      selectedSubtype ? `?subtype=${selectedSubtype}` : ''
    }`
    startTransition(() => router.push(url))
  }

  return (
    <div className="mt-4 space-y-6">
      <Subheading>
        Seleccioná el tipo de protocolo que querés crear.
      </Subheading>

      <div className="grid gap-4 sm:grid-cols-2">
        {Object.values(PROTOCOL_TYPES).map((t) => {
          const isSelected = selectedType === t.code
          return (
            <button
              key={t.code}
              type="button"
              onClick={() => setSelectedType(t.code)}
              className={cx(
                'flex flex-col gap-3 rounded-xl border p-5 text-left transition-all',
                'hover:border-primary-500 hover:shadow-md',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-950',
                isSelected
                  ? 'border-primary-950 bg-primary-50 ring-2 ring-primary-950 dark:bg-primary-950/20'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
              )}
            >
              <div className="flex items-center gap-3">
                {TYPE_ICONS[t.code]}
                <Text className="!text-lg !font-semibold">{t.label}</Text>
              </div>
              <Text className="!text-sm">{TYPE_DESCRIPTIONS[t.code]}</Text>
            </button>
          )
        })}
      </div>

      <div className="max-w-md">
        <FormListbox
          label="Subtipo (opcional)"
          description="Categoriza el protocolo según la taxonomía de VID. Podés cambiarlo más adelante."
          options={subtypeOptions}
          value={selectedSubtype as any}
          onChange={((v: ProtocolSubtype | '') => setSelectedSubtype(v)) as any}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!selectedType || isPending}
        >
          Continuar
          <ArrowNarrowRight data-slot="icon" />
        </Button>
      </div>
    </div>
  )
}
