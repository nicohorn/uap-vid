import PublishButton from '@protocol/elements/action-buttons/publish'
import ProtocolForm from '@protocol/protocol-form-template'
import { initialSectionValues } from '@utils/createContext'
import { canExecute } from '@utils/scopes'
import { ACTION, STATE } from '@utils/zod'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from 'app/api/auth/[...nextauth]/route'
import { findProtocolById } from 'repositories/protocol'

export default async function Page({
    params,
    searchParams,
}: {
    params: { id: string; section: string }
    searchParams: { convocatory: string }
}) {
    const session = await getServerSession(authOptions)
    if (!session) return
    if (!searchParams.convocatory && params.id === 'new')
        return redirect('/protocols')

    const protocol =
        params.id === 'new'
            ? {
                  convocatoryId: searchParams.convocatory,
                  state: STATE.DRAFT,
                  researcherId: session.user.id,
                  sections: initialSectionValues,
              }
            : await findProtocolById(params.id)

    if (!protocol) redirect('/protocols')
    if (
        !canExecute(
            session.user.id === protocol.researcherId
                ? ACTION.EDIT_BY_OWNER
                : ACTION.EDIT,
            session.user.role,
            protocol.state
        )
    )
        redirect('/protocols')

    return (
        <>
            <div className="mr-3 mt-1 flex items-center justify-end gap-2">
                <PublishButton userId={session.user.id} protocol={protocol} />
            </div>
            <ProtocolForm protocol={protocol} />
        </>
    )
}
