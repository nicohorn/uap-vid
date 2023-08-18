import { Button } from '@elements/button'
import type { State } from '@prisma/client'
import ProtocolStatesDictionary from '@utils/dictionaries/ProtocolStatesDictionary'
import type { ReactNode } from 'react'

export const PageHeading = ({
    title,
    state,
}: {
    title: string | ReactNode
    state?: State
}) => (
    <div className="mt-16">
        <h2 className="text-3xl font-bold text-black/70">{title}</h2>
        {state ? (
            <Button intent="badge" className="pointer-events-none">
                {ProtocolStatesDictionary[state]}
            </Button>
        ) : null}
    </div>
)
