import { getServerSession } from 'next-auth'
import { authOptions } from 'app/api/auth/[...nextauth]/auth'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { deleteFile, putFile } from '@utils/storage'
import { CV_MAX_BYTES, CV_MIME } from '@utils/zod/cv'
import { sanitizeCvFilename, sniffPdf } from '@utils/cv-validation'

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
      { error: 'El archivo supera el tamaño máximo de 10 MB.' },
      { status: 413 }
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json(
      { error: 'No se pudo leer el archivo enviado. Volvé a intentar.' },
      { status: 400 }
    )
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'No se recibió ningún archivo.' },
      { status: 400 }
    )
  }

  if (file.type && file.type !== CV_MIME) {
    return NextResponse.json(
      {
        error: `El archivo debe ser PDF (tipo recibido: ${file.type}).`,
      },
      { status: 415 }
    )
  }

  if (file.size > CV_MAX_BYTES) {
    return NextResponse.json(
      {
        error: `El archivo supera el tamaño máximo de 10 MB (tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB).`,
      },
      { status: 413 }
    )
  }

  const safeName = sanitizeCvFilename(file.name)
  if (!safeName.ok) {
    return NextResponse.json({ error: safeName.error }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  if (!sniffPdf(buffer)) {
    return NextResponse.json(
      {
        error:
          'El archivo no parece un PDF válido (no se encontró la firma %PDF en los primeros 1024 bytes).',
      },
      { status: 415 }
    )
  }

  const key = `cv/inline/${randomUUID()}.pdf`
  try {
    await putFile(key, buffer)
  } catch (error) {
    console.error('Inline CV upload failed (filesystem):', error)
    return NextResponse.json(
      {
        error:
          'Error al guardar el archivo en el servidor. Avisá al administrador del sistema.',
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    cvFileKey: key,
    cvFileName: safeName.value,
    cvFileSize: buffer.length,
    cvUploadedAt: new Date().toISOString(),
  })
}
