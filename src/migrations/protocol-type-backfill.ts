import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set')
  process.exit(1)
}

// Map legacy `sections.duration.modality` strings to subtype codes. The
// modality field has been the de-facto subtype until now; for existing
// protocols we derive subtype from it.
const SUBTYPE_FROM_MODALITY: Array<{ match: RegExp; code: string }> = [
  { match: /\(PIB\)/i, code: 'PIB' },
  { match: /\(PIC\)/i, code: 'PIC' },
  { match: /\(PRI\)/i, code: 'PRI' },
  { match: /\(PTP\)/i, code: 'PTP' },
]

const deriveSubtype = (modality: string | null | undefined): string | null => {
  if (!modality) return null
  const hit = SUBTYPE_FROM_MODALITY.find((m) => m.match.test(modality))
  return hit?.code ?? null
}

const migrate = async () => {
  const prisma = new PrismaClient()
  const protocols = await prisma.protocol.findMany({
    select: {
      id: true,
      protocolType: true,
      protocolSubtype: true,
      sections: { select: { duration: { select: { modality: true } } } },
    },
  })

  console.log(`Processing ${protocols.length} protocols...`)

  let updated = 0
  let skipped = 0

  await prisma.$transaction(
    async (tx) => {
      for (const p of protocols) {
        const needsType = !p.protocolType || p.protocolType === 'STANDARD' && p.protocolType !== 'STANDARD'
        const targetType = p.protocolType || 'STANDARD'
        const targetSubtype =
          p.protocolSubtype ?? deriveSubtype(p.sections.duration?.modality)

        if (
          p.protocolType === targetType &&
          p.protocolSubtype === targetSubtype
        ) {
          skipped++
          continue
        }

        await tx.protocol.update({
          where: { id: p.id },
          data: {
            protocolType: targetType,
            protocolSubtype: targetSubtype,
          },
        })
        updated++
      }
    },
    { timeout: 10000 * 60 * 60 }
  )

  console.log(`Done. ${updated} updated, ${skipped} skipped.`)
  await prisma.$disconnect()
}

migrate()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => process.exit(0))
