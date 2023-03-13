'use client'
import { Fragment, ReactNode, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
    ClipboardList,
    List,
    ListDetails,
    ReportSearch,
    Users,
    X,
    Menu2,
} from 'tabler-icons-react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@elements/Button'

const navigation = [
    {
        name: 'Proyectos de investigación',
        icon: List,
        href: '/protected',
        roles: [
            'Investigador',
            'Evaluador Interno',
            'Evaluador Externo',
            'Metodólogo',
            'Secretario de Investigación',
            'admin',
        ],
    },
    {
        name: 'Lista base de datos evaluadores',
        icon: ClipboardList,
        href: '#',
        roles: ['admin'],
    },
    {
        name: 'Seguimiento de proyectos aprobados',
        icon: ListDetails,
        href: '#',
        roles: ['admin'],
    },
    {
        name: 'Información de publicaciones científicas',
        icon: ReportSearch,
        href: '#',
        roles: ['admin'],
    },

    {
        name: 'Lista de usuarios',
        icon: Users,
        href: '/protected/admin/userlist',
        roles: ['admin'],
    },
]

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function Navigation({ children }: { children: ReactNode }) {
    const { data: session } = useSession()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()

    return (
        <>
            <Transition.Root show={sidebarOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-40 lg:hidden"
                    onClose={setSidebarOpen}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-40 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                                        <button
                                            type="button"
                                            className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                            onClick={() =>
                                                setSidebarOpen(false)
                                            }
                                        >
                                            <span className="sr-only">
                                                Close sidebar
                                            </span>
                                            <X
                                                className="h-6 w-6 text-white"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>
                                </Transition.Child>
                                <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                                    <nav className="mt-10 space-y-3 px-2">
                                        {navigation.map((item) =>
                                            item.roles.includes(
                                                session?.user?.role!
                                            ) ? (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className={classNames(
                                                        pathname === item.href
                                                            ? 'bg-primary text-white'
                                                            : 'text-base-700 hover:bg-base-100 hover:text-black',
                                                        'group flex items-center px-4 py-3 text-sm font-medium rounded'
                                                    )}
                                                    passHref
                                                >
                                                    <item.icon
                                                        className={classNames(
                                                            pathname ===
                                                                item.href
                                                                ? 'text-base-100'
                                                                : 'text-base-700 group-hover:text-black',
                                                            'mr-3 h-5 flex-shrink-0'
                                                        )}
                                                        aria-hidden="true"
                                                    />
                                                    {item.name}
                                                </Link>
                                            ) : null
                                        )}
                                    </nav>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                        <div className="w-14 flex-shrink-0">
                            {/* Force sidebar to shrink to fit close icon */}
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:absolute lg:inset-0 lg:flex lg:w-64 lg:flex-col">
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex min-h-0 flex-1 flex-col border-r border-base-200 bg-white">
                    <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                        <nav className="mt-10 flex-1 space-y-3 bg-white px-2">
                            {navigation.map((item) =>
                                item.roles.includes(session?.user?.role!) ? (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={classNames(
                                            pathname === item.href
                                                ? 'bg-primary text-white'
                                                : 'text-base-700 hover:bg-base-100 hover:text-black',
                                            'group flex items-center px-4 rounded py-3 text-sm font-medium'
                                        )}
                                        passHref
                                    >
                                        <item.icon
                                            className={classNames(
                                                pathname === item.href
                                                    ? 'text-base-100'
                                                    : 'text-base-700 group-hover:text-black',
                                                'mr-3 h-5 flex-shrink-0'
                                            )}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </Link>
                                ) : null
                            )}
                        </nav>
                    </div>
                </div>
            </div>
            <div className="flex flex-1 flex-col lg:pl-64">
                <div className="sticky -mt-10 -ml-12  z-10 sm:pl-3 sm:pt-3 lg:hidden">
                    <Button
                        intent="secondary"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Menu2 className="h-6 w-6" aria-hidden="true" />
                    </Button>
                </div>
                <main className="flex-1">
                    <div className="px-4 sm:px-6 lg:px-8">{children}</div>
                </main>
            </div>
        </>
    )
}
