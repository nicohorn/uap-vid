import type { ProtocolSectionsBibliography } from '@prisma/client'
import TextItemView from '@protocol/elements/view/text-item-view'
import {
  DescriptionDetails,
  DescriptionTerm,
} from '@components/description-list'
import { Text } from '@components/text'
import {
  chartToBibliographyHtml,
  chartToEntries,
  htmlToEntries,
} from '@utils/bibliography'
import { Link } from '@components/link'
import SectionViewer from '../elements/view/section-viewer'

interface BibliographyViewProps {
  data: ProtocolSectionsBibliography
}

const BibliographyView = ({ data }: BibliographyViewProps) => {
  const incoming = data as any
  const persisted = Array.isArray(incoming.entries) ? incoming.entries : []
  // Fall back to legacy data so protocols saved before this change still render.
  const entries =
    persisted.length > 0 ? persisted
    : incoming.chart?.length ? chartToEntries(incoming.chart)
    : incoming.content ? htmlToEntries(incoming.content)
    : []

  if (entries.length === 0) {
    // Last-ditch fallback to render whatever legacy HTML/chart we have so the
    // section isn't empty for very old protocols.
    const legacyHtml =
      incoming.content?.trim()?.length > 0 ?
        incoming.content
      : chartToBibliographyHtml(incoming.chart)
    return (
      <SectionViewer
        title="Bibliografía"
        description="Recursos a ser utilizados en la investigación"
      >
        <TextItemView
          title="Fuentes de información"
          content={legacyHtml || null}
        />
      </SectionViewer>
    )
  }

  return (
    <SectionViewer
      title="Bibliografía"
      description="Recursos a ser utilizados en la investigación"
    >
      <DescriptionTerm>Fuentes de información</DescriptionTerm>
      <DescriptionDetails>
        <ol className="ml-5 list-decimal space-y-1">
          {entries.map((entry: any, i: number) => (
            <li key={i}>
              <Text className="inline">{entry.content}</Text>
              {entry.link && /^https?:\/\//i.test(entry.link) && (
                <>
                  {' '}
                  <Link
                    href={entry.link}
                    target="_blank"
                    className="text-primary-700 underline dark:text-primary-300"
                  >
                    {entry.link}
                  </Link>
                </>
              )}
            </li>
          ))}
        </ol>
      </DescriptionDetails>
    </SectionViewer>
  )
}

export default BibliographyView
