'use client'

import { FileText } from 'tabler-icons-react'

// The team table wraps each row in an <Info> that disables pointer events
// for active members and opens a modal for inactive ones. The CV link must
// stay clickable and must not bubble the click up to that wrapper.
export function TeamMemberCvLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="pointer-events-auto inline-flex items-center gap-1 text-xs text-primary-700 hover:underline dark:text-primary-300"
    >
      <FileText className="size-3.5" />
      CV
    </a>
  )
}
