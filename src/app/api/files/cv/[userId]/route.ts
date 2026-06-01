import { getServerSession } from 'next-auth'
import { authOptions } from 'app/api/auth/[...nextauth]/auth'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { prisma } from '@utils/bd'
import { getFile, putFile, deleteFile } from '@utils/storage'
import { CV_MAX_BYTES, CV_MIME } from '@utils/zod/cv'
import { sanitizeCvFilename, sniffPdf } from '@utils/cv-validation'

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) => {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const { userId } = await params
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { cvFileKey: true, cvFileName: true },
  })

  if (!user?.cvFileKey) return new NextResponse('Not Found', { status: 404 })

  const data = await getFile(user.cvFileKey)
  if (!data) return new NextResponse('Not Found', { status: 404 })

  const filename = user.cvFileName || 'cv.pdf'
  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      'Content-Type': CV_MIME,
      'Content-Length': String(data.length),
      'Content-Disposition': `inline; filename="${encodeURIComponent(filename)}"`,
      'Cache-Control': 'private, max-age=0, must-revalidate',
    },
  })
}

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) => {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const { userId } = await params
  if (session.user.role === 'SCIENTIST' && session.user.id !== userId) {
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { cvFileKey: true },
  })
  if (!user) {
    return NextResponse.json(
      { error: 'El usuario no existe.' },
      { status: 404 }
    )
  }

  const newKey = `cv/${userId}/${randomUUID()}.pdf`

  try {
    await putFile(newKey, buffer)
  } catch (error) {
    console.error('CV upload failed (filesystem):', error)
    return NextResponse.json(
      {
        error:
          'Error al guardar el archivo en el servidor. Avisá al administrador del sistema.',
      },
      { status: 500 }
    )
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        cvFileKey: newKey,
        cvFileName: safeName.value,
        cvFileSize: buffer.length,
        cvUploadedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('CV upload failed (db):', error)
    // Roll back the file write to avoid orphans.
    await deleteFile(newKey).catch(() => {})
    return NextResponse.json(
      {
        error:
          'Error al actualizar el perfil del usuario. Intentá nuevamente.',
      },
      { status: 500 }
    )
  }

  if (user.cvFileKey && user.cvFileKey !== newKey) {
    await deleteFile(user.cvFileKey).catch(() => {})
  }

  return NextResponse.json({
    ok: true,
    cvFileName: safeName.value,
    cvFileSize: buffer.length,
  })
}

export const DELETE = async (
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) => {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const { userId } = await params
  const isSelf = session.user.id === userId
  const isAdmin = session.user.role === 'ADMIN'
  if (!isSelf && !isAdmin) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { cvFileKey: true },
  })
  if (user?.cvFileKey) {
    await deleteFile(user.cvFileKey)
  }
  await prisma.user.update({
    where: { id: userId },
    data: {
      cvFileKey: null,
      cvFileName: null,
      cvFileSize: null,
      cvUploadedAt: null,
    },
  })

  return NextResponse.json({ ok: true })
}
