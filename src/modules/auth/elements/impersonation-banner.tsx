'use client'

import { Button } from '@components/button'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Spy } from 'tabler-icons-react'

/**
 * Fixed banner shown while an admin is impersonating another user, with the
 * way back to their own account. Rendered globally from AppLayout.
 */
export function ImpersonationBanner() {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)

  if (!session?.impersonatedBy) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-3 border-t border-yellow-300 bg-yellow-100 px-4 py-2 text-sm text-yellow-900 dark:border-yellow-700 dark:bg-yellow-900/90 dark:text-yellow-100 print:hidden">
      <Spy size={18} className="shrink-0" />
      <span>
        Estás viendo la plataforma como{' '}
        <strong>{session.user.name}</strong> ({session.user.email})
      </span>
      <Button
        outline
        type="button"
        disabled={loading}
        onClick={async () => {
          setLoading(true)
          await update({ stopImpersonation: true })
          // Full navigation so every server component re-reads the session.
          window.location.href = '/users'
        }}
      >
        Volver a mi cuenta ({session.impersonatedBy.name})
      </Button>
    </div>
  )
}
