'use client'

import { Button } from '@components/button'
import { FieldGroup, Fieldset, Legend } from '@components/fieldset'
import { Text } from '@components/text'
import { useProtocolContext } from '@utils/createContext'
import { FormInput } from '@shared/form/form-input'
import { FormTextarea } from '@shared/form/form-textarea'
import { motion } from 'framer-motion'
import { Plus, Trash } from 'tabler-icons-react'

const emptyDirector = () => ({
  name: '',
  education: [{ degree: '', institution: '', date: '' }],
  indicators: {
    publications: '',
    rdProjects: '',
    workSupervision: '',
    scientificManagement: '',
    internationalCommittees: '',
    editorialCommittees: '',
    awards: '',
  },
})

export function TtDirectorsCvForm() {
  const form = useProtocolContext()
  const directors = form.values.sections.teacherThesis!.directorsCv

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7 }}
    >
      <Fieldset>
        <Legend>Currículum abreviado del director y codirectores</Legend>
        <Text className="!text-xs">
          Cargue un bloque por director/codirector.
        </Text>
      </Fieldset>

      {directors.map((director: any, i: number) => (
        <Fieldset
          key={i}
          className="mt-6 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <Legend>Director {i + 1}</Legend>
            <Button
              plain
              onClick={() =>
                form.removeListItem('sections.teacherThesis.directorsCv', i)
              }
            >
              <Trash data-slot="icon" />
              Quitar
            </Button>
          </div>
          <FieldGroup>
            <FormInput
              label="Nombre completo"
              {...form.getInputProps(
                `sections.teacherThesis.directorsCv.${i}.name`
              )}
            />

            <div>
              <Text className="!text-sm font-medium">Formación académica</Text>
              <FieldGroup>
                {director.education.map((_: any, eIndex: number) => (
                  <div
                    key={eIndex}
                    className="grid items-end gap-2 sm:grid-cols-[1fr,1fr,1fr,3rem]"
                  >
                    <FormInput
                      label={eIndex === 0 ? 'Título' : undefined}
                      {...form.getInputProps(
                        `sections.teacherThesis.directorsCv.${i}.education.${eIndex}.degree`
                      )}
                    />
                    <FormInput
                      label={eIndex === 0 ? 'Institución' : undefined}
                      {...form.getInputProps(
                        `sections.teacherThesis.directorsCv.${i}.education.${eIndex}.institution`
                      )}
                    />
                    <FormInput
                      label={eIndex === 0 ? 'Fecha' : undefined}
                      {...form.getInputProps(
                        `sections.teacherThesis.directorsCv.${i}.education.${eIndex}.date`
                      )}
                    />
                    <Button
                      plain
                      onClick={() =>
                        form.removeListItem(
                          `sections.teacherThesis.directorsCv.${i}.education`,
                          eIndex
                        )
                      }
                    >
                      <Trash data-slot="icon" />
                    </Button>
                  </div>
                ))}
                <Button
                  plain
                  onClick={() =>
                    form.insertListItem(
                      `sections.teacherThesis.directorsCv.${i}.education`,
                      { degree: '', institution: '', date: '' }
                    )
                  }
                >
                  <Plus data-slot="icon" />
                  Agregar título
                </Button>
              </FieldGroup>
            </div>

            <div>
              <Text className="!text-sm font-medium">
                Indicadores de calidad de la producción científica
              </Text>
              <FieldGroup>
                <FormTextarea
                  label="Publicaciones"
                  rows={2}
                  {...form.getInputProps(
                    `sections.teacherThesis.directorsCv.${i}.indicators.publications`
                  )}
                />
                <FormTextarea
                  label="Participación en proyectos I+D+i"
                  rows={2}
                  {...form.getInputProps(
                    `sections.teacherThesis.directorsCv.${i}.indicators.rdProjects`
                  )}
                />
                <FormTextarea
                  label="Dirección de trabajos"
                  rows={2}
                  {...form.getInputProps(
                    `sections.teacherThesis.directorsCv.${i}.indicators.workSupervision`
                  )}
                />
                <FormTextarea
                  label="Gestión de la actividad científica"
                  rows={2}
                  {...form.getInputProps(
                    `sections.teacherThesis.directorsCv.${i}.indicators.scientificManagement`
                  )}
                />
                <FormTextarea
                  label="Miembro de comités internacionales"
                  rows={2}
                  {...form.getInputProps(
                    `sections.teacherThesis.directorsCv.${i}.indicators.internationalCommittees`
                  )}
                />
                <FormTextarea
                  label="Miembro de comités editoriales"
                  rows={2}
                  {...form.getInputProps(
                    `sections.teacherThesis.directorsCv.${i}.indicators.editorialCommittees`
                  )}
                />
                <FormTextarea
                  label="Premios obtenidos"
                  rows={2}
                  {...form.getInputProps(
                    `sections.teacherThesis.directorsCv.${i}.indicators.awards`
                  )}
                />
              </FieldGroup>
            </div>
          </FieldGroup>
        </Fieldset>
      ))}

      <div className="mt-4">
        <Button
          plain
          onClick={() =>
            form.insertListItem(
              'sections.teacherThesis.directorsCv',
              emptyDirector()
            )
          }
        >
          <Plus data-slot="icon" />
          Agregar director/codirector
        </Button>
      </div>
    </motion.div>
  )
}
