import type { ProtocolSectionsTeacherThesisDirectorCv } from '@prisma/client'
import SectionViewer from '../../elements/view/section-viewer'
import {
  DescriptionDetails,
  DescriptionTerm,
} from '@components/description-list'
import { Text } from '@components/text'

interface Props {
  data: ProtocolSectionsTeacherThesisDirectorCv[]
}

const TtDirectorsCvView = ({ data }: Props) => (
  <SectionViewer
    title="CV del director y codirectores"
    description="Formación e indicadores de calidad científica"
  >
    {data.length === 0 ?
      <Text>—</Text>
    : data.map((director, i) => (
        <div key={i} className="mb-6">
          <DescriptionTerm>{director.name || `Director ${i + 1}`}</DescriptionTerm>
          <DescriptionDetails>
            <div className="space-y-3">
              <div>
                <Text className="!text-sm font-medium">Formación académica</Text>
                {director.education.length === 0 ?
                  <Text className="!text-sm">—</Text>
                : <ul className="ml-5 list-disc">
                    {director.education.map((e, j) => (
                      <li key={j}>
                        {e.degree} — {e.institution} ({e.date})
                      </li>
                    ))}
                  </ul>
                }
              </div>
              <div className="space-y-1">
                <Text className="!text-sm font-medium">Indicadores</Text>
                <Indicator label="Publicaciones" value={director.indicators.publications} />
                <Indicator
                  label="Proyectos I+D+i"
                  value={director.indicators.rdProjects}
                />
                <Indicator
                  label="Dirección de trabajos"
                  value={director.indicators.workSupervision}
                />
                <Indicator
                  label="Gestión científica"
                  value={director.indicators.scientificManagement}
                />
                <Indicator
                  label="Comités internacionales"
                  value={director.indicators.internationalCommittees}
                />
                <Indicator
                  label="Comités editoriales"
                  value={director.indicators.editorialCommittees}
                />
                <Indicator label="Premios" value={director.indicators.awards} />
              </div>
            </div>
          </DescriptionDetails>
        </div>
      ))
    }
  </SectionViewer>
)

const Indicator = ({ label, value }: { label: string; value: string }) => (
  <div className="grid gap-1 sm:grid-cols-[10rem,1fr]">
    <Text className="!text-xs font-medium">{label}</Text>
    <Text className="!text-sm">{value || '—'}</Text>
  </div>
)

export default TtDirectorsCvView
