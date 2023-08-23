import { buttonStyle } from '@elements/button/styles'
import { PageHeading } from '@layout/page-heading'
import { getTeamMembers } from '@repositories/team-member'
import { canAccess } from '@utils/scopes'
import { authOptions } from 'app/api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { UserPlus } from 'tabler-icons-react'

export default async function Page() {
    const session = await getServerSession(authOptions)

    if (session && canAccess('TEAM_MEMBERS', session.user.role)) {
        const teamMembers = await getTeamMembers()

        return (
            <>
                <PageHeading title={'Miembros del equipo de investigación'} />
                <Link
                    href={'/team-members/new'}
                    className={buttonStyle('secondary')}
                    passHref
                >
                    <UserPlus className="h-5 w-5 text-current" />
                    Nuevo miembro
                </Link>

                <pre className="text-xs">
                    {JSON.stringify(teamMembers, null, 2)}
                </pre>
            </>
        )
    }
    return redirect('/protocols')
}
