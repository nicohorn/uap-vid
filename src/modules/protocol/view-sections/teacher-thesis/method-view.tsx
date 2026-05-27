import type { ProtocolSectionsTeacherThesisMethod } from '@prisma/client'
import SectionViewer from '../../elements/view/section-viewer'
import ItemView from '@protocol/elements/view/item-view'

interface Props {
  data: ProtocolSectionsTeacherThesisMethod
}

const TtMethodView = ({ data }: Props) => {
  const isTheoretical = !!data.theoreticalMethodology?.trim()
  return (
    <SectionViewer
      title="Método"
      description={
        isTheoretical
          ? 'Investigación teórica'
          : 'Investigación cuantitativa, cualitativa o mixta'
      }
    >
      {isTheoretical ?
        <ItemView
          title="Metodología teórica"
          value={data.theoreticalMethodology ?? ''}
        />
      : <>
          <ItemView title="Diseño o tipo de investigación" value={data.design ?? ''} />
          <ItemView title="Participantes" value={data.participants ?? ''} />
          <ItemView title="Lugar" value={data.location ?? ''} />
          <ItemView
            title="Instrumentos de recolección"
            value={data.dataCollectionInstruments ?? ''}
          />
          <ItemView
            title="Procedimientos de recolección"
            value={data.dataCollectionProcedures ?? ''}
          />
          <ItemView title="Procesamiento y análisis" value={data.dataAnalysis ?? ''} />
          <ItemView
            title="Consideraciones éticas"
            value={data.ethicalConsiderations ?? ''}
          />
          <ItemView
            title="Grado de avance del Comité de Ética"
            value={data.ethicsCommitteeStatus ?? ''}
          />
        </>
      }
    </SectionViewer>
  )
}

export default TtMethodView
