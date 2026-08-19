import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set')
  process.exit(1)
}

// Email template for the ENABLE_OWNER_EDITING action (useCases.onOwnerEditingEnabled).
// Idempotent: the /emails admin page can only edit existing templates, so the
// row has to exist before secretaries start using the action. Without it the
// emailer falls back to a generic "Notificación del sistema" subject/heading.
const template = {
  useCase: 'onOwnerEditingEnabled',
  subject: 'Se habilitó la edición de tu proyecto',
  content:
    'La Secretaría de Investigación habilitó la edición de tu protocolo para que realices modificaciones. Motivo:',
}

const seed = async () => {
  const prisma = new PrismaClient()

  const existing = await prisma.emailContentTemplate.findFirst({
    where: { useCase: template.useCase },
  })
  if (existing) {
    console.log(`skipped  ${template.useCase}  (already exists)`)
  } else {
    await prisma.emailContentTemplate.create({ data: template })
    console.log(`created  ${template.useCase}`)
  }

  await prisma.$disconnect()
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
