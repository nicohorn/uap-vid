// Shared validation helpers for CV uploads (user-level and inline team CVs).

const PDF_SIG = Buffer.from('%PDF-')
// PDF spec allows up to 1024 bytes of leading content before the %PDF- header
// (used for shebangs, comments, byte-order marks, etc.). Sniffing the window
// instead of comparing the first 4 bytes prevents false negatives for legit
// PDFs produced by tools that prepend metadata.
const SNIFF_WINDOW = 1024

export const sniffPdf = (buffer: Buffer): boolean => {
  const window = buffer.subarray(0, Math.min(buffer.length, SNIFF_WINDOW))
  return window.indexOf(PDF_SIG) !== -1
}

// Filenames go into Content-Disposition headers and as the display name on the
// team form. Reject anything path-traversal-ish or absurdly long, normalize
// extension to .pdf.
export type SafeName =
  | { ok: true; value: string }
  | { ok: false; error: string }

export const sanitizeCvFilename = (raw: string | null | undefined): SafeName => {
  const trimmed = (raw ?? '').trim()
  if (!trimmed) {
    return { ok: false, error: 'El archivo no tiene nombre.' }
  }
  if (trimmed.length > 200) {
    return {
      ok: false,
      error: 'El nombre del archivo es demasiado largo (máx. 200 caracteres).',
    }
  }
  // Disallow path separators and control chars. Path separators would break
  // the storage key; control chars would break Content-Disposition parsing.
  // Spaces, dashes, accents, parens are fine.
  if (/[\x00-\x1f\\/]/.test(trimmed)) {
    return {
      ok: false,
      error:
        'El nombre del archivo contiene caracteres no permitidos (barras o caracteres de control). Renombrá el PDF y volvé a subirlo.',
    }
  }
  if (trimmed.includes('..')) {
    return {
      ok: false,
      error: 'El nombre del archivo no puede contener "..".',
    }
  }
  const withExt = trimmed.toLowerCase().endsWith('.pdf')
    ? trimmed
    : `${trimmed}.pdf`
  return { ok: true, value: withExt }
}
