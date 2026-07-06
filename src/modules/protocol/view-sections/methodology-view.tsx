import type { ProtocolSectionsMethodology } from '@prisma/client'
import SectionViewer from '../elements/view/section-viewer'
import ItemView from '@protocol/elements/view/item-view'
import TextItemView from '@protocol/elements/view/text-item-view'
import {
  methodologyTypeForApproach,
  QUANTITATIVE_QUALITATIVE_METHODOLOGY_TYPE,
  THEORETICAL_METHODOLOGY_TYPE,
} from '@utils/methodology'

interface MethodologyViewProps {
  data: ProtocolSectionsMethodology
  approach?: string | null
}

const MethodologyView = ({ data, approach }: MethodologyViewProps) => {
  // Protocols saved while methodology lived in its own tab carry `type`;
  // newer ones derive it from the description's approach dropdown.
  const type = data.type || methodologyTypeForApproach(approach)

  const shortData = [
    {
      title: 'Tipo de Metodología',
      value: type,
    },
  ]
  return (
    <SectionViewer title="Metodología" description="Metodología del proyecto">
      {shortData.map((item) => (
        <ItemView key={item.title} title={item.title} value={item.value} />
      ))}

      {type === QUANTITATIVE_QUALITATIVE_METHODOLOGY_TYPE && (
        <>
          <TextItemView
            title="Diseño y tipo de investigación"
            content={data.design}
          />
          <TextItemView title="Participantes" content={data.participants} />
          <TextItemView title="Lugar de desarrollo" content={data.place} />
          <TextItemView
            title="Instrumentos para recolección de datos"
            content={data.instruments}
          />
          <TextItemView
            title="Procedimientos para recolección de datos"
            content={data.procedures}
          />
          <TextItemView title="Análisis de datos" content={data.analysis} />
          <TextItemView title="Consideraciones" content={data.considerations} />
        </>
      )}

      {type === THEORETICAL_METHODOLOGY_TYPE && (
        <TextItemView title="Detalle de la metodología" content={data.detail} />
      )}
    </SectionViewer>
  )
}

export default MethodologyView
