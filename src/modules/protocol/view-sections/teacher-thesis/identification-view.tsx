import type { ProtocolSectionsTeacherThesisIdentification } from '@prisma/client'
import SectionViewer from '../../elements/view/section-viewer'
import ItemView from '@protocol/elements/view/item-view'
import {
  DescriptionDetails,
  DescriptionTerm,
} from '@components/description-list'
import { Text } from '@components/text'
import {
  POSTGRADUATE_PROGRAMS,
  SPONSORING_FACULTIES,
} from '@utils/protocol-types'

interface Props {
  data: ProtocolSectionsTeacherThesisIdentification
  title: string
}

const labelFor = <T extends string>(
  dict: Record<string, { code: T; label: string }>,
  code: string
) => dict[code]?.label ?? code

const TtIdentificationView = ({ data, title }: Props) => {
  const allMembers = [
    { ...data.thesisCandidate, role: data.thesisCandidate.role || 'Tesista' },
    { ...data.director, role: data.director.role || 'Director' },
    ...data.additionalMembers,
  ]

  return (
    <SectionViewer
      title="Identificación"
      description="Datos generales del proyecto"
    >
      <ItemView title="Título" value={title} />
      <ItemView title="Año" value={data.year ? String(data.year) : ''} />
      <ItemView
        title="Carrera de posgrado"
        value={labelFor(POSTGRADUATE_PROGRAMS as any, data.postgraduateProgram)}
      />
      <ItemView title="Tipo de tesis" value={data.thesisType} />
      <ItemView
        title="Ente patrocinante"
        value={labelFor(SPONSORING_FACULTIES as any, data.sponsoringFaculty)}
      />

      <DescriptionTerm>Equipo de investigación</DescriptionTerm>
      <DescriptionDetails>
        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-4 border-b pb-1">
            <Text className="text-left text-xs">Nombre</Text>
            <Text className="text-left text-xs">Rol</Text>
            <Text className="text-left text-xs">Horas semanales</Text>
          </div>
          {allMembers.map((m, i) => (
            <div key={i} className="grid grid-cols-3 gap-4 py-1">
              <Text className="text-left">{m.name || '—'}</Text>
              <Text className="text-left">{m.role || '—'}</Text>
              <Text className="text-left">{m.weeklyHours}</Text>
            </div>
          ))}
        </div>
      </DescriptionDetails>

      <DescriptionTerm>
        Especialistas elegibles para evaluadores
      </DescriptionTerm>
      <DescriptionDetails>
        {data.eligibleEvaluators.length === 0 ?
          <Text>—</Text>
        : <ul className="ml-5 list-disc">
            {data.eligibleEvaluators.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        }
      </DescriptionDetails>
    </SectionViewer>
  )
}

export default TtIdentificationView
