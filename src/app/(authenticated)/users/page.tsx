import Link from 'next/link'
import { Button } from '@elements/button'
import { PageHeading } from '@layout/page-heading'
import { UserPlus } from 'tabler-icons-react'
import { getServerSession } from 'next-auth'
import { authOptions } from 'app/api/auth/[...nextauth]/route'
import { canAccess } from '@utils/scopes'
import { redirect } from 'next/navigation'
import UserTable from '@user/user-table'
import { getUsers } from '@repositories/user'

export default async function UserList({
    searchParams,
}: {
    searchParams?: { [key: string]: string }
}) {
    const session = await getServerSession(authOptions)
    if (!session) return
    if (!canAccess('USERS', session.user.role)) redirect('/protocols')

    const [userCount, users] = await getUsers(
        Number(searchParams?.records) || 4,
        Number(searchParams?.page) || 1,
        searchParams?.search,
        searchParams?.order && { [searchParams?.order]: searchParams?.sort }
    )

    return (
        <>
            <PageHeading title="Lista de usuarios" />
            <div className="flex flex-row-reverse">
                <Link href={'/users/new'} passHref>
                    <Button intent="secondary">
                        <UserPlus className="h-5" />
                        <span className="ml-3"> Nuevo usuario</span>
                    </Button>
                </Link>
            </div>

            <UserTable
                users={users}
                page={Number(searchParams?.page)}
                userCount={userCount ?? 0}
            />
        </>
    )
}
