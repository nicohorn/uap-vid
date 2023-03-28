import { Heading } from '@layout/Heading'
import { Protocol } from '@prisma/client'
import CreateButton from '@protocol/elements/action-buttons/Create'
import Table from '@protocol/elements/Table'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import {
    getProtocolByRol,
    getTotalRecordsProtocol,
} from 'repositories/protocol'

import Pagination from '@elements/Pagination'

// SSR Server Component, so no need to fetch from api endpoint
export default async function Page({ searchParams }: { searchParams: any }) {
    const session = await getServerSession(authOptions)
    if (!session) return redirect('/login')
    const protocolCount = await getTotalRecordsProtocol()

    const protocols = session.user
        ? await getProtocolByRol(
              session.user.role,
              session.user.id,
              Number(searchParams?.page) || 1
          )
        : []

    return (
        <>
            <Heading title="Lista de proyectos de investigación" />
            <p className="ml-4 mt-2 text-sm text-gray-500">
                Lista de todos los protocolos cargados en el sistema, haz click
                en &apos;ver&apos; para más detalles.
            </p>

            <div className="flex justify-end">
                <CreateButton role={session?.user?.role!} />
            </div>

            <Table items={protocols} />
            <Pagination
                pageParams={Number(searchParams.page) || 1}
                count={protocolCount}
                href="/protocols"
            />
        </>
    )
}
