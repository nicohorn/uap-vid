import { getServerSession } from 'next-auth'
import { authOptions } from 'app/api/auth/[...nextauth]/auth'
import { NextResponse } from 'next/server'
import { getFile } from '@utils/storage'
import { CV_MIME } from '@utils/zod/cv'

// Stream an inline CV back to the browser. The path segments are
// joined to reconstruct the storage key (e.g. cv/inline/<uuid>.pdf).
// We restrict the path to keys under cv/inline/ to prevent traversal.
export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> }
) => {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const { key } = await params
  if (!Array.isArray(key) || key.length === 0) {
    return new NextResponse('Not Found', { status: 404 })
  }
  const storageKey = `cv/inline/${key.join('/')}`
  if (!storageKey.startsWith('cv/inline/') || storageKey.includes('..')) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const data = await getFile(storageKey)
  if (!data) return new NextResponse('Not Found', { status: 404 })

  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      'Content-Type': CV_MIME,
      'Content-Length': String(data.length),
      'Content-Disposition': 'inline; filename="cv.pdf"',
      'Cache-Control': 'private, max-age=0, must-revalidate',
    },
  })
}
