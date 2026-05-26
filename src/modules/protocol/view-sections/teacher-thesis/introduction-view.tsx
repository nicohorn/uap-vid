import type { ProtocolSectionsTeacherThesisIntroduction } from '@prisma/client'
import SectionViewer from '../../elements/view/section-viewer'
import TextItemView from '@protocol/elements/view/text-item-view'

interface Props {
  data: ProtocolSectionsTeacherThesisIntroduction
}

const TtIntroductionView = ({ data }: Props) => (
  <SectionViewer title="Introducción" description="Marco general del proyecto">
    <TextItemView
      title="Estado actual del tema y antecedentes"
      content={data.stateOfTheArt}
    />
    <TextItemView
      title="Justificación científica, académico-institucional y social"
      content={data.justification}
    />
    <TextItemView title="Definición del problema" content={data.problemDefinition} />
    <TextItemView title="Objetivos" content={data.objectives} />
  </SectionViewer>
)

export default TtIntroductionView
