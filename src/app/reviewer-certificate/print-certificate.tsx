'use client'

import { Button } from '@components/button'
import { useEffect } from 'react'
import { FileCertificate } from 'tabler-icons-react'

// Opens the print dialog once the page (including the logo and signature
// images) has fully loaded. The button stays as a manual fallback.
export function PrintCertificate() {
  useEffect(() => {
    if (document.readyState === 'complete') return window.print()
    window.addEventListener('load', window.print)
    return () => window.removeEventListener('load', window.print)
  }, [])

  return (
    <Button
      onClick={() => window.print()}
      outline
      className="mx-auto mb-8 print:hidden"
    >
      <FileCertificate data-slot="icon" /> Descargar certificado de evaluación
    </Button>
  )
}
