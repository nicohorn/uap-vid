import Navigation from '@auth/Navigation'
import Profile from 'modules/user/ProfileView'
import { Breadcrumb } from '@elements/Breadcrumb'
import { Heading } from '@layout/Heading'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from 'pages/api/auth/[...nextauth]'

export default async function Page() {
    const session = await getServerSession(authOptions)
    return (
        <>
            <Heading title="Perfil" />
            <Profile user={session?.user!} />
        </>
    )
}
