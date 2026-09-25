/* eslint-disable @next/next/no-img-element */
import { authOptions } from 'app/api/auth/[...nextauth]/auth'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { getReviewsByReviewerId } from '@repositories/review'
import { findProtocolById } from '@repositories/protocol'
import { PrintCertificate } from './print-certificate'

export default async function Page() {
  const session = await getServerSession(authOptions)
  if (!session) return
  const user = session.user

  const reviews = await getReviewsByReviewerId(user.id)
  if (reviews.length === 0) redirect('/profile')

  const protocols = await Promise.all(
    reviews.map((r) => findProtocolById(r.protocolId))
  )

  return (
    <>
      <PrintCertificate />
      <img className="mx-auto h-[6rem]" src="/UAPazul.png" alt="UAP" />
      <div className="my-6 text-justify text-sm/5">
        Por medio de la presente se deja constancia que <b>{user.name}</b>,
        <b> DNI {user.dni}</b>, participó como evaluador/a de{' '}
        {reviews.length > 1 ?
          <span className="font-bold">{reviews.length} proyectos </span>
        : <span className="font-bold">un proyecto </span>}{' '}
        de investigación de la Universidad Adventista del Plata:
        <div className="my-6 flex flex-col gap-2 px-2 text-xs italic">
          {protocols.map((p) => (
            <div key={p?.id}>-{p?.sections.identification.title}</div>
          ))}
        </div>
        A los fines que diere lugar, se extiende la presente constancia en
        <span className="font-semibold">
          {' '}
          Libertador San Martín, Entre Ríos, Argentina, el{' '}
          {new Date().toLocaleDateString('es-AR')}{' '}
        </span>
        <img
          className="mx-auto mt-8 h-[10rem]"
          src="/CertificateFooter.png"
          alt="Sello y firma"
        />
      </div>
    </>
  )
}
