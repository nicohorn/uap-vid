'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useNotifications } from '@mantine/notifications'
import { Check, X } from 'tabler-icons-react'
import { Button } from '@elements/button'

import { ROLE } from '@utils/zod'
import { RoleSelector } from './elements/role-selector'

export default function UserForm() {
    const router = useRouter()
    const [newUser, setNewUser] = useState({ role: ROLE.RESEARCHER })
    const [loading, setLoading] = useState(false)
    const notifications = useNotifications()
    const createNewUser = async () => {
        setLoading(true)
        const res = await fetch(`/api/auth/signup`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser),
        })
        if (res.status === 201) {
            notifications.showNotification({
                title: 'Usuario creado',
                message: 'El usuario fue creado correctamente',
                color: 'success',
                icon: <Check />,
                radius: 0,
                style: {
                    marginBottom: '.8rem',
                },
            })
            setLoading(false)
            router.push('/users')
        } else if (res.status === 422) {
            notifications.showNotification({
                title: 'Usuario existente',
                message: 'El usuario ya existe',
                color: 'red',
                icon: <X />,
                radius: 0,
                style: {
                    marginBottom: '.8rem',
                },
            })
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                createNewUser()
            }}
            className="mx-auto max-w-7xl place-items-stretch lg:grid lg:grid-cols-2"
        >
            <div className="m-3 p-1">
                <label className="label">Nombre Completo</label>
                <input
                    required
                    className="input"
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    onChange={(e) =>
                        setNewUser({
                            ...newUser,
                            [e.target.name]: e.target.value,
                        })
                    }
                />
            </div>
            <div className="m-3 p-1">
                <label className="label">Email</label>
                <input
                    required
                    className="input"
                    type="email"
                    name="email"
                    placeholder="ejemplo@uap.edu.ar"
                    onChange={(e) =>
                        setNewUser({
                            ...newUser,
                            [e.target.name]: e.target.value,
                        })
                    }
                />
            </div>
            <div className="m-3 p-1">
                <label className="label">Contraseña</label>
                <input
                    required
                    className="input"
                    type="password"
                    name="password"
                    placeholder="****"
                    onChange={(e) =>
                        setNewUser({
                            ...newUser,
                            [e.target.name]: e.target.value,
                        })
                    }
                />
            </div>
            <div className="m-3 p-1">
                <label className="label">Rol</label>
                <RoleSelector user={newUser} />
            </div>
            <Button
                type="submit"
                className="float-right m-4 lg:col-start-2 lg:col-end-3 lg:place-self-end"
            >
                {loading ? (
                    <span className="loader-primary h-5 w-5"></span>
                ) : (
                    'Crear Nuevo Usuario'
                )}
            </Button>
        </form>
    )
}
