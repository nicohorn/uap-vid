/* eslint-disable @next/next/no-server-import-in-page */
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { State } from '@prisma/client'
import { updateProtocolStateById } from '@repositories/protocol'
import { logProtocolUpdate } from '@utils/logger'

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = params.id
    const protocol = await request.json()
    if (protocol) delete protocol.id
    const updated = await updateProtocolStateById(id, State.ON_GOING)

    await logProtocolUpdate({
        fromState: State.ACCEPTED,
        toState: State.ON_GOING,
        protocolId: id,
    })

    if (!updated) {
        return new Response('We cannot approve this protocol', { status: 500 })
    }
    return NextResponse.json({ success: true })
}
