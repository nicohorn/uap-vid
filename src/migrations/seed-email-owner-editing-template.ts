import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set')
  process.exit(1)
}

// Email templates for the owner-editing flow (useCases.onOwnerEditingEnabled /
// onOwnerEditingFinished). Idempotent: the /emails admin page can only edit
// existing templates, so the rows have to exist before the actions are used.
// Without them the emailer falls back to a generic "Notificación del sistema"
// subject/heading.
const templates = [
  {
    useCase: 'onOwnerEditingEnabled',
    subject: 'Se habilitó la edición de tu proyecto',
    content:
      'La Secretaría de Investigación habilitó la edición de tu protocolo para que realices modificaciones. Motivo:',
  },
  {
    useCase: 'onOwnerEditingFinished',
    subject: 'El director finalizó las correcciones del proyecto',
    content:
      'El director del proyecto marcó como finalizadas las modificaciones que le fueron solicitadas.',
  },
]

const seed = async () => {
  const prisma = new PrismaClient()

  for (const template of templates) {
    const existing = await prisma.emailContentTemplate.findFirst({
      where: { useCase: template.useCase },
    })
    if (existing) {
      console.log(`skipped  ${template.useCase}  (already exists)`)
    } else {
      await prisma.emailContentTemplate.create({ data: template })
      console.log(`created  ${template.useCase}`)
    }
  }

  await prisma.$disconnect()
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
