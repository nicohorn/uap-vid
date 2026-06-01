'use client'

import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
} from '@components/alert'
import { Button } from '@components/button'
import { cx } from '@utils/cx'
import { useState, type ReactNode } from 'react'
import { InfoCircle } from 'tabler-icons-react'

// Click-to-open info dialog used throughout the protocol form. Previously a
// CSS-hover popup with no viewport awareness — tall content (e.g. discipline
// classifications) got cut off when triggered near the bottom of the form.
// The Alert panel handles scrolling and centering for us.
export default function InfoTooltip({
  children,
  title = 'Información',
  className,
}: {
  children: ReactNode
  title?: string
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className={cx('flex h-0 justify-end', className)}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Mostrar información"
          className="pointer-events-auto mt-2 transition-transform hover:scale-110"
        >
          <InfoCircle className="h-4 w-4 cursor-help text-gray-600 hover:text-primary" />
        </button>
      </div>
      <Alert open={isOpen} onClose={setIsOpen} size="2xl">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          <div className="prose prose-zinc max-w-none text-sm dark:prose-invert">
            {children}
          </div>
        </AlertDescription>
        <AlertActions>
          <Button onClick={() => setIsOpen(false)}>Cerrar</Button>
        </AlertActions>
      </Alert>
    </>
  )
}
