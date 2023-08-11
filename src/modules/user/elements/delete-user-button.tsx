'use client'
import { notifications } from '@mantine/notifications'
import { useRouter } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'

let timeout: NodeJS.Timeout

export function DeleteUserButton({ userId }: { userId: string }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [deleting, setDeleting] = useState(false)

    const deleteUser = useCallback(async () => {
        const res = await fetch(`/api/users/${userId}`, {
            method: 'DELETE',
        })
        if (res.ok) {
            notifications.show({
                title: 'Usuario eliminado',
                message: 'El usuario ha sido eliminado con éxito.',
                color: 'green',
            })
            return startTransition(() => router.refresh())
        }
        notifications.show({
            title: 'No se pudo eliminar usuario',
            message:
                'El usuario esta vinculado con algún protocolo y no se puede eliminar.',
            color: 'red',
        })
        setDeleting(false)
        return startTransition(() => router.refresh())
    }, [router, userId])

    return deleting ? (
        <button
            onClick={() => {
                clearTimeout(timeout)
                setDeleting(false)
            }}
            disabled={isPending}
            className="-mr-2 flex w-full items-center justify-end gap-1 text-error-600/60 transition duration-150 hover:text-error-600"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
            >
                <path
                    fill="currentColor"
                    d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
                    opacity=".25"
                ></path>
                <path
                    fill="currentColor"
                    d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
                >
                    <animateTransform
                        attributeName="transform"
                        dur="0.75s"
                        repeatCount="indefinite"
                        type="rotate"
                        values="0 12 12;360 12 12"
                    ></animateTransform>
                </path>
            </svg>
            Cancelar
        </button>
    ) : (
        <button
            onClick={() => {
                setDeleting(true)
                timeout = setTimeout(() => {
                    deleteUser()
                }, 3000)
            }}
            disabled={isPending}
            className="transition duration-150 hover:text-black/70"
        >
            Eliminar
        </button>
    )
}
