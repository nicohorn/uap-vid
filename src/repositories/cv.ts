'use server'

import { prisma } from '../utils/bd'
import { deleteFile } from '@utils/storage'

export const getCvMetadata = async (userId: string) =>
  prisma.user.findUnique({
    where: { id: userId },
    select: {
      cvFileKey: true,
      cvFileName: true,
      cvFileSize: true,
      cvUploadedAt: true,
    },
  })

export const userHasCv = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { cvFileKey: true },
  })
  return Boolean(user?.cvFileKey)
}

export const clearCv = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { cvFileKey: true },
  })
  if (user?.cvFileKey) {
    await deleteFile(user.cvFileKey)
  }
  return prisma.user.update({
    where: { id: userId },
    data: {
      cvFileKey: null,
      cvFileName: null,
      cvFileSize: null,
      cvUploadedAt: null,
    },
  })
}
