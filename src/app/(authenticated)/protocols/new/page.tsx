import { Button } from '@components/button'
import { Subheading } from '@components/heading'
import { Text } from '@components/text'
import { userHasCv } from '@repositories/cv'
import { authOptions } from 'app/api/auth/[...nextauth]/auth'
import { getServerSession } from 'next-auth'
import { Upload } from 'tabler-icons-react'
import { ProtocolTypeCards } from './protocol-type-cards'

export default async function NewProtocolPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const hasCv = await userHasCv(session.user.id)
  if (!hasCv) {
    return (
      <div className="mt-6 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/30">
        <Subheading className="!text-amber-900 dark:!text-amber-200">
          Cargá tu CV antes de crear un protocolo
        </Subheading>
        <Text className="mt-2">
          Para crear un nuevo protocolo de investigación necesitás tener un CV
          en formato PDF asociado a tu perfil. El CV es visible para los
          miembros del sistema que revisarán tu protocolo.
        </Text>
        <div className="mt-4">
          <Button href="/profile">
            <Upload data-slot="icon" /> Ir a mi perfil para cargar el CV
          </Button>
        </div>
      </div>
    )
  }

  return <ProtocolTypeCards />
}
