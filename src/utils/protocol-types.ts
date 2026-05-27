type Dict<Code extends string> = Record<
  Code,
  { code: Code; label: string; description?: string }
>

const dict = <Code extends string>(entries: { code: Code; label: string; description?: string }[]) =>
  Object.fromEntries(entries.map((e) => [e.code, e])) as Dict<Code>

export type ProtocolType = 'STANDARD' | 'TEACHER_THESIS'
export const PROTOCOL_TYPES = dict<ProtocolType>([
  { code: 'STANDARD', label: 'Estándar' },
  { code: 'TEACHER_THESIS', label: 'Tesis docente' },
])

// TODO(VID): confirm full subtype list. Current set inferred from existing
// modality strings (PIC/PRI/PTP) plus Viviana's docx comment mentioning PIB.
export type ProtocolSubtype = 'PIB' | 'PIC' | 'PRI' | 'PTP'
export const PROTOCOL_SUBTYPES = dict<ProtocolSubtype>([
  { code: 'PIB', label: 'PIB', description: 'Proyecto de Investigación Básica' },
  { code: 'PIC', label: 'PIC', description: 'Proyecto de investigación desde las cátedras' },
  { code: 'PRI', label: 'PRI', description: 'Proyecto regular de investigación' },
  { code: 'PTP', label: 'PTP', description: 'Proyecto Tesis Posgrado' },
])

export type PostgraduateProgram = 'MASTERS' | 'DOCTORATE'
export const POSTGRADUATE_PROGRAMS = dict<PostgraduateProgram>([
  { code: 'MASTERS', label: 'Maestría' },
  { code: 'DOCTORATE', label: 'Doctorado' },
])

export type SponsoringFaculty = 'FACEA' | 'FCS' | 'FHECIS' | 'FT'
export const SPONSORING_FACULTIES = dict<SponsoringFaculty>([
  { code: 'FACEA', label: 'Facultad de Ciencias Económicas y de la Administración (FACEA)' },
  { code: 'FCS', label: 'Facultad de Ciencias de la Salud (FCS)' },
  { code: 'FHECIS', label: 'Facultad de Humanidades, Educación y Ciencias Sociales (FHECIS)' },
  { code: 'FT', label: 'Facultad de Teología (FT)' },
])

export type DurationMonths = 'TWELVE' | 'TWENTY_FOUR'
export const DURATION_MONTHS = dict<DurationMonths>([
  { code: 'TWELVE', label: '12 meses' },
  { code: 'TWENTY_FOUR', label: '24 meses' },
])

export type ApplicationField =
  | 'EXACT_NATURAL_SCIENCES'
  | 'ENGINEERING_TECHNOLOGY'
  | 'MEDICAL_SCIENCES'
  | 'AGRICULTURAL_VETERINARY'
  | 'SOCIAL_SCIENCES'
  | 'HUMANITIES_ARTS'
export const APPLICATION_FIELDS = dict<ApplicationField>([
  {
    code: 'EXACT_NATURAL_SCIENCES',
    label: 'Ciencias exactas y naturales',
    description:
      'Matemática, física, química, biología, geología, informática, astronomía y ciencias afines',
  },
  {
    code: 'ENGINEERING_TECHNOLOGY',
    label: 'Ingeniería y tecnología',
    description:
      'Ingenierías, telecomunicaciones, arquitectura, urbanismo, minería, alimentos y tecnologías aplicadas',
  },
  {
    code: 'MEDICAL_SCIENCES',
    label: 'Ciencias médicas',
    description:
      'Medicina, odontología, enfermería, farmacia, fisioterapia, salud pública y áreas relacionadas',
  },
  {
    code: 'AGRICULTURAL_VETERINARY',
    label: 'Ciencias agrícolas y veterinarias',
    description:
      'Agronomía, ganadería, pesca, silvicultura, veterinaria y producción agropecuaria',
  },
  {
    code: 'SOCIAL_SCIENCES',
    label: 'Ciencias sociales',
    description:
      'Educación, economía, psicología, sociología, ciencias políticas, derecho y administración',
  },
  {
    code: 'HUMANITIES_ARTS',
    label: 'Humanidades y artes',
    description:
      'Filosofía, religión, historia, arqueología, lenguas, literatura y estudios artísticos y culturales',
  },
])

export type SocioeconomicObjective =
  | 'EARTH_EXPLORATION'
  | 'ENVIRONMENT'
  | 'SPACE_EXPLORATION'
  | 'TRANSPORT_TELECOM_INFRASTRUCTURE'
  | 'ENERGY'
  | 'INDUSTRIAL_PRODUCTION'
  | 'HEALTH'
  | 'AGRICULTURE'
  | 'EDUCATION'
  | 'CULTURE_RECREATION_MEDIA'
  | 'POLITICAL_SOCIAL_SYSTEMS'
  | 'GENERAL_KNOWLEDGE'
  | 'DEFENSE'
export const SOCIOECONOMIC_OBJECTIVES = dict<SocioeconomicObjective>([
  {
    code: 'EARTH_EXPLORATION',
    label: 'Exploración y explotación de la tierra',
    description: 'Recursos naturales, clima, océanos, atmósfera e hidrología',
  },
  {
    code: 'ENVIRONMENT',
    label: 'Medio ambiente',
    description: 'Contaminación, prevención, control y protección ambiental',
  },
  {
    code: 'SPACE_EXPLORATION',
    label: 'Exploración y explotación del espacio',
    description: 'Investigación espacial, astronomía, satélites y navegación espacial',
  },
  {
    code: 'TRANSPORT_TELECOM_INFRASTRUCTURE',
    label: 'Transporte, telecomunicaciones e infraestructura',
    description: 'Transporte, telecomunicaciones, urbanismo, edificios e infraestructura',
  },
  {
    code: 'ENERGY',
    label: 'Energía',
    description: 'Producción, almacenamiento, distribución y uso eficiente de la energía',
  },
  {
    code: 'INDUSTRIAL_PRODUCTION',
    label: 'Producción y tecnología industrial',
    description: 'Procesos industriales, manufactura y tecnología aplicada a la producción',
  },
  {
    code: 'HEALTH',
    label: 'Salud',
    description: 'Prevención, promoción y atención de la salud humana',
  },
  {
    code: 'AGRICULTURE',
    label: 'Agricultura',
    description: 'Investigación agropecuaria, forestal, pesquera y producción de alimentos',
  },
  {
    code: 'EDUCATION',
    label: 'Educación',
    description: 'Enseñanza, aprendizaje, didáctica y sistemas educativos',
  },
  {
    code: 'CULTURE_RECREATION_MEDIA',
    label: 'Cultura, recreación, religión y medios',
    description: 'Cultura, comunicación, integración social, deporte y religión',
  },
  {
    code: 'POLITICAL_SOCIAL_SYSTEMS',
    label: 'Estructuras, procesos y sistemas políticos y sociales',
    description: 'Política, sociedad, gobernanza, pobreza y problemáticas sociales',
  },
  {
    code: 'GENERAL_KNOWLEDGE',
    label: 'Producción general de conocimiento',
    description: 'Investigación básica sin aplicación específica inmediata',
  },
  {
    code: 'DEFENSE',
    label: 'Defensa',
    description: 'Investigación con fines militares y estratégicos',
  },
])

export type ResearchType = 'BASIC' | 'APPLIED' | 'EXPERIMENTAL'
export const RESEARCH_TYPES = dict<ResearchType>([
  { code: 'BASIC', label: 'Básica' },
  { code: 'APPLIED', label: 'Aplicada' },
  { code: 'EXPERIMENTAL', label: 'Experimental' },
])

export type PublicationType = 'ARTICLE' | 'BOOK'
export const PUBLICATION_TYPES = dict<PublicationType>([
  { code: 'ARTICLE', label: 'Artículo' },
  { code: 'BOOK', label: 'Libro' },
])
