import View from '@protocol/protocol-view-template'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { findProtocolById } from 'repositories/protocol'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Note: /protocols/new is handled by protocols/new/page.tsx; this branch only runs for real ids.
  const protocol = await findProtocolById(id)

  if (!protocol) {
    redirect('/protocols')
  }

  return (
    <View
      sections={protocol.sections}
      protocolType={protocol.protocolType}
    />
  )
}
