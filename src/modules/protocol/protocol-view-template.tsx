import { type ProtocolSections } from '@prisma/client'
import BibliographyView from './view-sections/bibliography-view'
import DescriptionView from './view-sections/description-view'
import DurationView from './view-sections/duration-view'
import IdentificationView from './view-sections/identification-view'
import IntroductionView from './view-sections/introduction-view'
import PublicationView from './view-sections/publication-view'
import BudgetView from './view-sections/budget-view'
import TtIdentificationView from './view-sections/teacher-thesis/identification-view'
import TtDurationView from './view-sections/teacher-thesis/duration-view'
import TtDescriptionView from './view-sections/teacher-thesis/description-view'
import TtIntroductionView from './view-sections/teacher-thesis/introduction-view'
import TtMethodView from './view-sections/teacher-thesis/method-view'
import TtPublicationView from './view-sections/teacher-thesis/publication-view'

export default async function View({
  sections,
  protocolType,
}: {
  sections: ProtocolSections
  protocolType?: string | null
}) {
  if (protocolType === 'TEACHER_THESIS' && sections.teacherThesis) {
    return (
      <>
        <TtIdentificationView
          data={sections.teacherThesis.identification}
          title={sections.identification.title}
        />
        <TtDurationView data={sections.teacherThesis.duration} />
        <TtDescriptionView data={sections.teacherThesis.description} />
        <TtIntroductionView data={sections.teacherThesis.introduction} />
        <TtMethodView data={sections.teacherThesis.method} />
        <TtPublicationView data={sections.teacherThesis.publication} />
        <BibliographyView data={sections.bibliography} />
      </>
    )
  }

  return (
    <>
      <IdentificationView data={sections.identification} />
      <DurationView data={sections.duration} />
      <BudgetView data={sections.budget} />
      <DescriptionView data={sections.description} />
      <IntroductionView data={sections.introduction} />
      <PublicationView data={sections.publication} />
      <BibliographyView data={sections.bibliography} />
    </>
  )
}
