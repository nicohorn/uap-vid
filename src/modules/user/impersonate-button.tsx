'use client'

import { Button } from '@components/button'
import { notifications } from '@elements/notifications'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Spy } from 'tabler-icons-react'

/**
 * Admin-only: swaps the session to the given user (keeping the admin's
 * identity in the token to restore it later). The actual authorization
 * happens server-side in the JWT callback — this button only requests it.
 */
export function ImpersonateButton({
  userId,
  userName,
}: {
  userId: string
  userName: string
}) {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)

  // Hide for your own row and while already impersonating.
  if (!session || session.user.id === userId || session.impersonatedBy)
    return null

  return (
    <Button
      plain
      type="button"
      title={`Ver la plataforma como ${userName}`}
      className="relative z-10"
      disabled={loading}
      onClick={async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setLoading(true)
        const updated = await update({ impersonateUserId: userId })
        if (updated?.impersonatedBy) {
          // Full navigation so every server component re-reads the session.
          window.location.href = '/protocols'
        } else {
          setLoading(false)
          notifications.show({
            title: 'No se pudo impersonar',
            message: 'No se pudo iniciar la sesión como este usuario',
            intent: 'error',
          })
        }
      }}
    >
      <Spy data-slot="icon" />
      Impersonar
    </Button>
  )
}
