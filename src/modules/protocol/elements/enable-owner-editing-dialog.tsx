'use client'

import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from '@components/dialog'
import { FieldGroup, FormActions } from '@components/fieldset'
import { Button } from '@components/button'
import { FormTextarea } from '@shared/form/form-textarea'
import { SubmitButton } from '@shared/submit-button'
import { notifications } from '@elements/notifications'
import { enableOwnerEditing } from '@actions/protocol/enable-owner-editing'
import { useForm } from '@mantine/form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

/**
 * Asks the secretary/admin for the reason before unlocking owner editing on a
 * PUBLISHED / under-evaluation protocol. The reason is mandatory: it's what
 * gets logged and emailed to the researcher.
 */
export function EnableOwnerEditingDialog({
  protocolId,
  open,
  onClose,
}: {
  protocolId: string
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm({
    initialValues: { reason: '' },
    validate: {
      reason: (value) =>
        value.trim().length > 0 ? null : 'Debe indicar el motivo',
    },
  })

  const close = () => {
    form.reset()
    onClose()
  }

  const handleSubmit = async ({ reason }: typeof form.values) => {
    setIsLoading(true)
    const result = await enableOwnerEditing(protocolId, reason)
    setIsLoading(false)
    notifications.show(result.notification)
    if (result.status) {
      close()
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onClose={close} size="lg">
      <DialogTitle>Habilitar edición al director</DialogTitle>
      <DialogDescription>
        El proyecto se mantiene en su estado actual, pero el director podrá
        editarlo hasta el próximo cambio de estado. Se registrará el motivo y se
        le enviará un email al director con el mismo.
      </DialogDescription>
      <DialogBody>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <FieldGroup>
            <FormTextarea
              label="Motivo"
              description="Qué debe modificar el director en el proyecto"
              rows={4}
              {...form.getInputProps('reason')}
            />
          </FieldGroup>
          <FormActions>
            <Button plain onClick={close} disabled={isLoading}>
              Cancelar
            </Button>
            <SubmitButton isLoading={isLoading}>Habilitar edición</SubmitButton>
          </FormActions>
        </form>
      </DialogBody>
    </Dialog>
  )
}
