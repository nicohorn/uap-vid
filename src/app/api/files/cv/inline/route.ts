import { getServerSession } from 'next-auth'
import { authOptions } from 'app/api/auth/[...nextauth]/auth'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { putFile } from '@utils/storage'
import { CV_MAX_BYTES, CV_MIME } from '@utils/zod/cv'

const PDF_MAGIC = Buffer.from('%PDF')

// Upload an "inline" CV for a team member that isn't linked to a UAP user
// account. The protocol form attaches the returned key to the team entry's
// cvFileKey field; the file is fetched back via the inline GET route.
export const POST = async (req: Request) => {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse('Unauthorized', { status: 401 })
  if (session.user.role === 'SCIENTIST') {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const contentLength = Number(req.headers.get('content-length') || 0)
  if (contentLength > CV_MAX_BYTES * 1.1) {
    return NextResponse.json(
      { error: 'El archivo supera el tamaño máximo de 10 MB' },
      { status: 413 }
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'Falta el archivo (campo "file")' },
      { status: 400 }
    )
  }

  if (file.type && file.type !== CV_MIME) {
    return NextResponse.json(
      { error: 'El archivo debe ser PDF' },
      { status: 415 }
    )
  }

  if (file.size > CV_MAX_BYTES) {
    return NextResponse.json(
      { error: 'El archivo supera el tamaño máximo de 10 MB' },
      { status: 413 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  if (!buffer.subarray(0, 4).equals(PDF_MAGIC)) {
    return NextResponse.json(
      { error: 'El archivo no es un PDF válido' },
      { status: 415 }
    )
  }

  const key = `cv/inline/${randomUUID()}.pdf`
  await putFile(key, buffer)

  const original =
    (file.name || 'cv.pdf').endsWith('.pdf') ?
      file.name || 'cv.pdf'
    : `${file.name || 'cv'}.pdf`

  return NextResponse.json({
    ok: true,
    cvFileKey: key,
    cvFileName: original,
    cvFileSize: buffer.length,
    cvUploadedAt: new Date().toISOString(),
  })
}
