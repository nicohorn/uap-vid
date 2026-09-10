import { z } from 'zod'

export const CV_MAX_BYTES = 10 * 1024 * 1024 // 10 MB
export const CV_MIME = 'application/pdf'

export const CvMetadataSchema = z.object({
  cvFileKey: z.string().nullable(),
  cvFileName: z.string().nullable(),
  cvFileSize: z.number().int().positive().nullable(),
  cvUploadedAt: z.date().nullable(),
})

export type CvMetadata = z.infer<typeof CvMetadataSchema>

/**
 * URL that streams a CV back to the browser. Inline CVs (external team
 * members) are keyed by their storage path; UAP users are keyed by user id.
 */
export const cvHref = ({
  inlineCvFileKey,
  userId,
  userHasCv,
}: {
  inlineCvFileKey?: string | null
  userId?: string | null
  userHasCv?: boolean
}): string | null => {
  if (inlineCvFileKey) {
    return `/api/files/cv/inline/${inlineCvFileKey.replace(/^cv\/inline\//, '')}`
  }
  if (userId && userHasCv) return `/api/files/cv/${userId}`
  return null
}
