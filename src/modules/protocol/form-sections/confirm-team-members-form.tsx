'use client'

import { Divider } from '@components/divider'
import { Fieldset, FormActions, Label } from '@components/fieldset'
import { Heading, Subheading } from '@components/heading'
import { notifications } from '@elements/notifications'
import { useForm, zodResolver } from '@mantine/form'
import type { Prisma, ProtocolSectionsIdentificationTeam } from '@prisma/client'
import { updateProtocolTeamMembers } from '@repositories/protocol'
import {
  findOrCreateTeamMemberByName,
  getAllTeamMembers,
} from '@repositories/team-member'
import { getCategoriesForForm } from '@repositories/team-member-category'
import { SubmitButton } from '@shared/submit-button'
import { FormCombobox } from '@shared/form/form-combobox'
import { FormInput } from '@shared/form/form-input'
import { Button } from '@components/button'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ConfirmTeamSchema } from '@utils/zod'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Edit, Loader } from 'tabler-icons-react'

type ProtocolMetadataAndTeamMembers = Prisma.ProtocolGetPayload<{
  select: {
    id: true
    protocolNumber: true
    createdAt: true
    state: true
    flags: true
    convocatory: { select: { id: true; name: true } }
    researcher: {
      select: { name: true; email: true; id: true; role: true }
    }
    sections: {
      select: { identification: { select: { title: true; team: true } } }
    }
  }
}>

export function ConfirmTeamMembersForm({
  protocol,
}: {
  protocol: ProtocolMetadataAndTeamMembers
}) {
  const router = useRouter()
  // Rows where the member is typed by hand (not in the list yet).
  const [manualInputMode, setManualInputMode] = useState<{
    [key: number]: boolean
  }>({})

  const form = useForm({
    initialValues: { team: protocol.sections.identification.team },
    validate: zodResolver(ConfirmTeamSchema),
    validateInputOnChange: true,
    validateInputOnBlur: true,
  })

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => await getAllTeamMembers(),
  })

  const { data: categories, isLoading: tmsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => await getCategoriesForForm(),
  })

  const toggleManualInput = (
    idx: number,
    tm: ProtocolSectionsIdentificationTeam
  ) => {
    const manual = !manualInputMode[idx]
    setManualInputMode((prev) => ({ ...prev, [idx]: manual }))
    // Reset the row so it has to be picked/typed again.
    form.setFieldValue(`team.${idx}.teamMemberId`, null)
    form.setFieldValue(
      `team.${idx}.toBeConfirmed`,
      !(manual && form.getValues().team[idx]?.name?.trim())
    )
    if (manual)
      form.setFieldValue(
        `team.${idx}.role`,
        categories?.find((c) => c.id == tm.categoryToBeConfirmed)?.name
      )
  }

  const { mutate } = useMutation({
    mutationKey: [protocol.id],
    mutationFn: async (values: ProtocolSectionsIdentificationTeam[]) => {
      // Members typed manually don't exist yet: find or create them by name.
      const team = await Promise.all(
        values.map(async (tm) => {
          // The view shows the role of the assignments, which still say
          // 'A definir' until the member is confirmed.
          const confirmed = {
            ...tm,
            assignments: tm.assignments.map((a) =>
              a.role === 'A definir' && tm.role !== 'A definir' ?
                { ...a, role: tm.role }
              : a
            ),
          }
          if (confirmed.teamMemberId || !confirmed.name?.trim())
            return confirmed
          const member = await findOrCreateTeamMemberByName(confirmed.name)
          return member ? { ...confirmed, teamMemberId: member.id } : confirmed
        })
      )
      if (team.some((tm) => !tm.teamMemberId)) {
        notifications.show({
          title: 'Error',
          message: 'No se pudo registrar el miembro de equipo ingresado',
          intent: 'error',
        })
        return
      }
      const result = await updateProtocolTeamMembers(protocol.id, team)
      if (result) {
        const isOngoing = protocol.state === 'ON_GOING'
        notifications.show({
          title: 'Protocolo actualizado',
          message:
            isOngoing ?
              'Se guardaron los miembros de equipo correctamente y se actualizó automáticamente el presupuesto anual'
            : 'Se guardaron los miembros de equipo correctamente',
          intent: 'success',
        })
        router.refresh()
      } else {
        notifications.show({
          title: 'Error',
          message: 'Ocurrió un error al actualizar los miembros de equipo',
          intent: 'error',
        })
      }
    },
  })

  return (
    <>
      {tmsLoading ?
        <Loader className="mx-auto animate-spin text-primary dark:text-white" />
      : <form
          onSubmit={form.onSubmit((values) => mutate(values.team))}
          className="mx-auto mt-10 w-fit max-w-xl rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
        >
          {' '}
          <Heading>Confirmar miembros de equipo</Heading>
          <Subheading className="whitespace-pre-wrap">
            Para poder visualizar los detalles de este protocolo de
            investigación, debe confirmar los miembros de equipo de
            investigación que aun no están definidos.
          </Subheading>
          <Divider className="mt-4" />
          <Fieldset>
            <Label className="mb-1.5 !text-xs">
              Seleccione el miembro de equipo que corresponda
            </Label>

            {protocol.sections.identification.team.map((tm, idx) => {
              return (
                <div
                  key={idx}
                  className={
                    tm.toBeConfirmed == true ?
                      'grid max-w-xl grid-cols-6 items-center gap-3'
                    : 'hidden'
                  }
                >
                  <Subheading className="col-span-2">
                    {
                      categories?.find((c) => c.id == tm.categoryToBeConfirmed)
                        ?.name
                    }
                  </Subheading>
                  <div className="col-span-4 my-1 flex items-start gap-1">
                    {manualInputMode[idx] ?
                      <FormInput
                        className="flex-1"
                        label=""
                        type="text"
                        placeholder="Nombre del miembro de equipo"
                        error={
                          form.getInputProps(`team.${idx}.teamMemberId`).error
                        }
                        value={form.getValues().team[idx]?.name ?? ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          form.setFieldValue(`team.${idx}.name`, e.target.value)
                          form.setFieldValue(`team.${idx}.teamMemberId`, null)
                          form.setFieldValue(
                            `team.${idx}.role`,
                            categories?.find(
                              (c) => c.id == tm.categoryToBeConfirmed
                            )?.name
                          )
                          form.setFieldValue(
                            `team.${idx}.toBeConfirmed`,
                            e.target.value.trim().length == 0
                          )
                        }}
                      />
                    : <FormCombobox
                        error={
                          form.getInputProps(`team.${idx}.teamMemberId`).error
                        }
                        className="flex-1"
                        label=""
                        options={
                          teamMembers?.map((e) => ({
                            value: e.id,
                            label: e.name,
                          })) ?? []
                        }
                        disabled={isLoading}
                        onChange={(e: any) => {
                          form.setFieldValue(`team.${idx}.teamMemberId`, e)
                          form.setFieldValue(
                            `team.${idx}.role`,
                            categories?.find(
                              (c) => c.id == tm.categoryToBeConfirmed
                            )?.name
                          )
                          form.setFieldValue(`team.${idx}.toBeConfirmed`, false)
                        }}
                      />
                    }
                    {manualInputMode[idx] ?
                      <Button
                        type="button"
                        className="bg-blue-600 px-2 py-1 text-xs text-white transition-colors hover:bg-blue-700"
                        title="Seleccionar de lista"
                        onClick={() => toggleManualInput(idx, tm)}
                      >
                        <Edit size={16} />
                      </Button>
                    : <Button
                        type="button"
                        plain
                        className="px-2 py-1 text-xs transition-colors hover:bg-gray-100"
                        title="Ingresar manualmente"
                        onClick={() => toggleManualInput(idx, tm)}
                      >
                        <Edit size={16} />
                      </Button>
                    }
                  </div>
                </div>
              )
            })}
          </Fieldset>
          <FormActions>
            <SubmitButton disabled={!form.isValid()}>Guardar</SubmitButton>
          </FormActions>
        </form>
      }
    </>
  )
}
