import type { ProtocolSectionsTeacherThesisDescription } from '@prisma/client'
import SectionViewer from '../../elements/view/section-viewer'
import ItemView from '@protocol/elements/view/item-view'
import {
  APPLICATION_FIELDS,
  RESEARCH_TYPES,
  SOCIOECONOMIC_OBJECTIVES,
} from '@utils/protocol-types'

interface Props {
  data: ProtocolSectionsTeacherThesisDescription
}

const label = <T extends string>(
  dict: Record<string, { code: T; label: string }>,
  code: string
) => dict[code]?.label ?? code

const TtDescriptionView = ({ data }: Props) => (
  <SectionViewer
    title="Descripción"
    description="Disciplina, línea y objetivos del proyecto"
  >
    <ItemView title="Disciplina general" value={data.generalDiscipline} />
    <ItemView title="Área específica del conocimiento" value={data.specificArea} />
    <ItemView title="Línea de investigación" value={data.researchLine} />
    <ItemView title="Resumen técnico" value={data.technicalAbstract} />
    <ItemView title="Palabras clave" value={data.keywords.join(', ')} />
    <ItemView
      title="Campo de aplicación"
      value={label(APPLICATION_FIELDS as any, data.applicationField)}
    />
    <ItemView
      title="Objetivo socioeconómico"
      value={label(SOCIOECONOMIC_OBJECTIVES as any, data.socioeconomicObjective)}
    />
    <ItemView
      title="Tipo de investigación"
      value={label(RESEARCH_TYPES as any, data.researchType)}
    />
  </SectionViewer>
)

export default TtDescriptionView
