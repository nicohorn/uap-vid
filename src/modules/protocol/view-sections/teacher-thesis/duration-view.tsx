import type { ProtocolSectionsTeacherThesisDuration } from '@prisma/client'
import SectionViewer from '../../elements/view/section-viewer'
import ItemView from '@protocol/elements/view/item-view'
import {
  DescriptionDetails,
  DescriptionTerm,
} from '@components/description-list'
import { Text } from '@components/text'
import { DURATION_MONTHS } from '@utils/protocol-types'

interface Props {
  data: ProtocolSectionsTeacherThesisDuration
}

const TtDurationView = ({ data }: Props) => (
  <SectionViewer
    title="Duración y cronograma"
    description="Plazos del proyecto y actividades por semestre"
  >
    <ItemView
      title="Duración"
      value={
        (DURATION_MONTHS as Record<string, { label: string }>)[
          data.durationMonths
        ]?.label || data.durationMonths
      }
    />
    <DescriptionTerm>Cronograma</DescriptionTerm>
    <DescriptionDetails>
      <div className="space-y-3">
        {data.schedule.map((entry, i) => (
          <div key={i}>
            <Text className="font-medium">{entry.semester}.° semestre</Text>
            {entry.activities.length === 0 ?
              <Text className="ml-4 !text-sm">Sin actividades</Text>
            : <ul className="ml-5 list-disc">
                {entry.activities.map((a, j) => (
                  <li key={j}>{a}</li>
                ))}
              </ul>
            }
          </div>
        ))}
      </div>
    </DescriptionDetails>
  </SectionViewer>
)

export default TtDurationView
