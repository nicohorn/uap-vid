import type { ProtocolSectionsTeacherThesisPublication } from '@prisma/client'
import SectionViewer from '../../elements/view/section-viewer'
import ItemView from '@protocol/elements/view/item-view'
import TextItemView from '@protocol/elements/view/text-item-view'
import { PUBLICATION_TYPES } from '@utils/protocol-types'

interface Props {
  data: ProtocolSectionsTeacherThesisPublication
}

const TtPublicationView = ({ data }: Props) => (
  <SectionViewer
    title="Publicación científica"
    description="Plan previsto para la difusión de los resultados"
  >
    <ItemView
      title="Tipo de publicación"
      value={
        (PUBLICATION_TYPES as Record<string, { label: string }>)[
          data.publicationType
        ]?.label || data.publicationType
      }
    />
    <TextItemView title="Plan de publicación" content={data.publicationPlan} />
  </SectionViewer>
)

export default TtPublicationView
