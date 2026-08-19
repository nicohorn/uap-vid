export enum useCases {
  onReview = 'onReview',
  onRevised = 'onRevised',
  onAssignation = 'onAssignation',
  onPublish = 'onPublish',
  onApprove = 'onApprove',
  onOwnerEditingEnabled = 'onOwnerEditingEnabled',
  onOwnerEditingFinished = 'onOwnerEditingFinished',
  changeUserEmail = 'changeUserEmail',
  passwordReset = 'passwordReset',
}

export const useCasesDictionary: { [key: string]: string } = {
  onReview: 'Evaluación de protocolo',
  onRevised: 'Corrección de protocolo',
  onAssignation: 'Asignación de evaluador',
  onPublish: 'Publicación de protocolo',
  onApprove: 'Aprobación de protocolo',
  onOwnerEditingEnabled: 'Habilitación de edición',
  onOwnerEditingFinished: 'Correcciones del director finalizadas',
  changeUserEmail: 'Cambio de email',
  passwordReset: 'Recuperación de contraseña',
}
