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
import { finishOwnerEditing } from '@actions/protocol/finish-owner-editing'
import { useForm } from '@mantine/form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

/**
 * Owner-side counterpart of EnableOwnerEditingDialog: marks the requested
 * corrections as done, which closes the unlock and emails the secretary who
 * asked for them. The comment is optional.
 */
export function FinishOwnerEditingDialog({
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
  const form = useForm({ initialValues: { comment: '' } })

  const close = () => {
    form.reset()
    onClose()
  }

  const handleSubmit = async ({ comment }: typeof form.values) => {
    setIsLoading(true)
    const result = await finishOwnerEditing(protocolId, comment)
    setIsLoading(false)
    notifications.show(result.notification)
    if (result.status) {
      close()
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onClose={close} size="lg">
      <DialogTitle>Finalizar correcciones</DialogTitle>
      <DialogDescription>
        Confirma que ya realizaste las modificaciones solicitadas. Se cierra la
        edición del proyecto y se notifica por email a la Secretaría de
        Investigación.
      </DialogDescription>
      <DialogBody>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <FieldGroup>
            <FormTextarea
              label="Comentario (opcional)"
              description="Aclaraciones sobre los cambios realizados"
              rows={3}
              {...form.getInputProps('comment')}
            />
          </FieldGroup>
          <FormActions>
            <Button plain onClick={close} disabled={isLoading}>
              Cancelar
            </Button>
            <SubmitButton isLoading={isLoading}>
              Finalizar correcciones
            </SubmitButton>
          </FormActions>
        </form>
      </DialogBody>
    </Dialog>
  )
}
