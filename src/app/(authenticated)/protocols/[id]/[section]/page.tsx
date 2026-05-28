import ProtocolForm from '@protocol/protocol-form-template'
import { canExecute } from '@utils/scopes'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from 'app/api/auth/[...nextauth]/auth'
import { findProtocolById } from 'repositories/protocol'
import { Action } from '@prisma/client'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; section: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return

  // New-protocol creation lives at /protocols/new/<type>/<section>; this route
  // only handles editing existing protocols.
  const protocol = await findProtocolById(id)
  if (!protocol) redirect('/protocols')

  // Allow admins to edit protocols in any state (admin override)
  const isAdmin = session.user.role === 'ADMIN'
  const canEdit =
    isAdmin ||
    canExecute(
      session.user.id === protocol.researcherId ?
        Action.EDIT_BY_OWNER
      : Action.EDIT,
      session.user.role,
      protocol.state,
      protocol.protocolType
    )

  if (canEdit) {
    return <ProtocolForm protocol={protocol as any} />
  }

  redirect('/protocols')
}
