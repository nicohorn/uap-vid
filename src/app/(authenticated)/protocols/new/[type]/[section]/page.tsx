import ProtocolForm from '@protocol/protocol-form-template'
import { initialSectionValues } from '@utils/createContext'
import { slugToType } from '@utils/protocol-types'
import { ProtocolState } from '@prisma/client'
import { authOptions } from 'app/api/auth/[...nextauth]/auth'
import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'

export default async function NewProtocolFormPage({
  params,
}: {
  params: Promise<{ type: string; section: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) return null
  if (session.user.role === 'SCIENTIST') redirect('/protocols')

  const { type: typeSlug, section } = await params

  const protocolType = slugToType(typeSlug)
  if (!protocolType) notFound()

  // Both STANDARD and TEACHER_THESIS expose 7 sections (0–6).
  const sectionIndex = Number(section)
  if (Number.isNaN(sectionIndex) || sectionIndex < 0 || sectionIndex > 6) {
    redirect(`/protocols/new/${typeSlug}/0`)
  }

  return (
    <ProtocolForm
      protocol={{
        state: ProtocolState.DRAFT,
        researcherId: session.user.id,
        protocolType,
        protocolSubtype: null,
        sections: initialSectionValues,
      }}
    />
  )
}
