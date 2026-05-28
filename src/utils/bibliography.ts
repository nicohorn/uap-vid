type ChartEntry = {
  author?: string | null
  title?: string | null
  year?: number | string | null
  url?: string | null
}

export type BibliographyEntry = {
  content: string
  link: string
}

const URL_REGEX = /(https?:\/\/[^\s<>"')]+)/i

/**
 * Parse a block of pasted bibliography text into {content, link} entries.
 * Splits on newlines, treats each non-empty line as one entry, and pulls out
 * the first http(s) URL it finds in the line (if any). Trailing punctuation
 * on the content (after the URL is removed) is trimmed.
 */
export const parseBibliographyText = (text: string): BibliographyEntry[] => {
  if (!text?.trim()) return []
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(URL_REGEX)
      const link = match?.[1] ?? ''
      const content = (link ? line.replace(link, '') : line)
        .replace(/\s+/g, ' ')
        .trim()
        // strip trailing separators left by URL removal
        .replace(/[.,;\-–—\s]+$/, '')
        .trim()
      return { content, link }
    })
    .filter((e) => e.content || e.link)
}

/** Convert legacy chart rows into the new {content, link} entry shape. */
export const chartToEntries = (
  chart: ChartEntry[] | null | undefined
): BibliographyEntry[] => {
  if (!chart?.length) return []
  return chart
    .map((entry) => {
      const author = entry.author?.toString().trim() ?? ''
      const title = entry.title?.toString().trim() ?? ''
      const yearNum = Number(entry.year)
      const year = Number.isFinite(yearNum) && yearNum > 0 ? String(yearNum) : ''
      const url = entry.url?.toString().trim() ?? ''

      let content = author
      if (year) content += `${content ? ' ' : ''}(${year})`
      if (title) content += `${content ? '. ' : ''}${title}`
      return { content: content.trim(), link: url }
    })
    .filter((e) => e.content || e.link)
}

/**
 * Best-effort migration from the legacy `content` rich-text HTML into the new
 * {content, link} entries shape. Splits on <p> blocks and pulls out the first
 * link per block.
 */
export const htmlToEntries = (html: string | null | undefined): BibliographyEntry[] => {
  if (!html?.trim()) return []
  // Split into block-level chunks; supports <p>, <li>, and <br>-separated text.
  const blocks = html
    .replace(/<br\s*\/?>/gi, '\n')
    .split(/<\/?(?:p|li)[^>]*>/gi)
    .map((b) => b.trim())
    .filter(Boolean)
  return blocks
    .map((block) => {
      const linkMatch = block.match(/<a[^>]*href=["']([^"']+)["'][^>]*>/i)
      const link = linkMatch?.[1] ?? ''
      // Strip all HTML tags, decode common entities, collapse whitespace.
      const text = block
        .replace(/<[^>]*>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      // If the URL appears verbatim in the text (we rendered it both as text
      // and href in chartToBibliographyHtml), strip the duplicate.
      const content =
        link && text.endsWith(link) ? text.slice(0, -link.length).replace(/[.,;\-\s]+$/, '').trim() : text
      return { content, link }
    })
    .filter((e) => e.content || e.link)
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')

export const chartToBibliographyHtml = (chart: ChartEntry[] | null | undefined) => {
  if (!chart?.length) return ''

  return chart
    .map((entry) => {
      const author = entry.author?.toString().trim() ?? ''
      const title = entry.title?.toString().trim() ?? ''
      const yearNum = Number(entry.year)
      const year = Number.isFinite(yearNum) && yearNum > 0 ? String(yearNum) : ''
      const url = entry.url?.toString().trim() ?? ''

      let prose = author
      if (year) prose += `${prose ? ' ' : ''}(${year})`
      if (title) prose += `${prose ? '. ' : ''}${title}`

      const safeProse = escapeHtml(prose)
      const isSafeUrl = /^https?:\/\//i.test(url)
      const link =
        url ?
          isSafeUrl ?
            `<a href="${escapeHtml(url)}">${escapeHtml(url)}</a>`
          : escapeHtml(url)
        : ''

      const body =
        link ?
          `${safeProse}${safeProse ? '. ' : ''}${link}`
        : safeProse

      return body ? `<p>${body}</p>` : ''
    })
    .filter(Boolean)
    .join('')
}
