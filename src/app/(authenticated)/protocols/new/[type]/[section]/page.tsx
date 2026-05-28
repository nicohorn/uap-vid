import ProtocolForm from '@protocol/protocol-form-template'
import { userHasCv } from '@repositories/cv'
import { initialSectionValues } from '@utils/createContext'
import {
  PROTOCOL_SUBTYPES,
  slugToType,
  type ProtocolSubtype,
} from '@utils/protocol-types'
import { ProtocolState } from '@prisma/client'
import { authOptions } from 'app/api/auth/[...nextauth]/auth'
import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'

export default async function NewProtocolFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string; section: string }>
  searchParams: Promise<{ subtype?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) return null
  if (session.user.role === 'SCIENTIST') redirect('/protocols')

  // Block direct URLs from bypassing the CV requirement; the parent page
  // (/protocols/new) shows a friendlier explanation.
  if (!(await userHasCv(session.user.id))) redirect('/protocols/new')

  const { type: typeSlug, section } = await params
  const { subtype } = await searchParams

  const protocolType = slugToType(typeSlug)
  if (!protocolType) notFound()

  const protocolSubtype: ProtocolSubtype | null =
    subtype && subtype in PROTOCOL_SUBTYPES ? (subtype as ProtocolSubtype) : null

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
        protocolSubtype,
        sections: initialSectionValues,
      }}
    />
  )
}
