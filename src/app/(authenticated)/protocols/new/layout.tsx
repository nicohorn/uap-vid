import { Heading } from '@components/heading'
import { authOptions } from 'app/api/auth/[...nextauth]/auth'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

export default async function NewProtocolLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) return null
  if (session.user.role === 'SCIENTIST') redirect('/protocols')

  return (
    <>
      <Heading>Nuevo protocolo</Heading>
      {children}
    </>
  )
}
