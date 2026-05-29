'use client'

import { Button } from '@components/button'
import { notifications } from '@elements/notifications'
import { CV_MAX_BYTES, CV_MIME } from '@utils/zod/cv'
import { useRef, useState } from 'react'
import { Check, FileText, Upload } from 'tabler-icons-react'

type LinkedUserCv = {
  userId: string
  cvFileKey: string | null
  cvFileName?: string | null
} | null

type Props = {
  /** Linked UAP user (with their existing CV state) if the team member is selected from the user list. */
  linkedUser: LinkedUserCv
  /** Inline CV on this team entry (used for external members). */
  inlineCvFileKey: string | null
  inlineCvFileName: string | null
  /** Called with new metadata after a successful upload — the form persists it. */
  onUpload: (meta: {
    cvFileKey: string
    cvFileName: string
    cvFileSize: number
    cvUploadedAt: string
  }) => void
  disabled?: boolean
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export function TeamMemberCvCell({
  linkedUser,
  inlineCvFileKey,
  inlineCvFileName,
  onUpload,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // What does the row "have" right now? Either an inline CV (external members)
  // or the linked user's account-CV (UAP members).
  const hasInline = Boolean(inlineCvFileKey)
  const hasUserCv = Boolean(linkedUser?.cvFileKey)
  const cvPresent = hasInline || hasUserCv
  const downloadHref =
    hasInline ? `/api/files/cv/inline/${inlineCvFileKey?.replace(/^cv\/inline\//, '')}`
    : hasUserCv ? `/api/files/cv/${linkedUser!.userId}`
    : null
  const displayName =
    hasInline ? inlineCvFileName || 'cv.pdf'
    : hasUserCv ? linkedUser!.cvFileName || 'cv.pdf'
    : null

  const upload = async (file: File) => {
    if (file.type !== CV_MIME) {
      notifications.show({
        title: 'Formato inválido',
        message: 'El archivo debe ser PDF',
        intent: 'error',
      })
      return
    }
    if (file.size > CV_MAX_BYTES) {
      notifications.show({
        title: 'Archivo demasiado grande',
        message: `El CV no puede superar ${formatBytes(CV_MAX_BYTES)}`,
        intent: 'error',
      })
      return
    }

    setIsUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      // UAP user → upload to their account so the CV is reused across protocols.
      // External member → upload inline; the key is stored on the team entry.
      const endpoint =
        linkedUser?.userId ?
          `/api/files/cv/${linkedUser.userId}`
        : `/api/files/cv/inline`
      const res = await fetch(endpoint, { method: 'POST', body: form })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        notifications.show({
          title: 'Error al subir',
          message: data?.error || 'No se pudo subir el CV',
          intent: 'error',
        })
        return
      }
      const data = await res.json()
      onUpload({
        cvFileKey: data.cvFileKey,
        cvFileName: data.cvFileName,
        cvFileSize: data.cvFileSize,
        cvUploadedAt: data.cvUploadedAt ?? new Date().toISOString(),
      })
      notifications.show({
        title: 'CV cargado',
        message: 'El CV se asoció al miembro',
        intent: 'success',
      })
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void upload(file)
        }}
      />
      {cvPresent && downloadHref && (
        <a
          href={downloadHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-1 text-xs text-teal-800 hover:underline dark:bg-teal-900/30 dark:text-teal-200"
          title={displayName ?? undefined}
        >
          <Check className="size-3.5" />
          <FileText className="size-3.5" />
        </a>
      )}
      <Button
        type="button"
        plain
        disabled={disabled || isUploading}
        onClick={() => inputRef.current?.click()}
        title={cvPresent ? 'Reemplazar CV' : 'Cargar CV'}
      >
        <Upload data-slot="icon" />
      </Button>
    </div>
  )
}
