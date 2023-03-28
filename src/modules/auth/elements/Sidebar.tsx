'use client'
import { canAccess } from '@utils/scopes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { navigation } from './navigation'
import { User } from '@prisma/client'

export default function Sidebar({ user }: { user: User }) {
    const pathname = usePathname()
    return (
        <div className="hidden lg:sticky lg:inset-0 lg:flex lg:h-full lg:max-h-screen lg:w-64 lg:flex-col">
            {/* Sidebar component, swap this element with another sidebar if you like */}
            <div className="flex min-h-0 flex-1 flex-col border-r bg-base-50">
                <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                    <nav className="flex-1 space-y-3 px-1.5">
                        {navigation.map((item) =>
                            canAccess(item.scope, user.role) ? (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={clsx(
                                        {
                                            'bg-gray-100 ring-2 ring-primary/80 ring-offset-1 hover:ring-offset-2':
                                                pathname?.includes(item.href),

                                            'bg-primary text-white':
                                                pathname === item.href,
                                        },
                                        'text-base-700 hover:bg-gray-100 hover:text-black',
                                        'group flex items-center rounded px-4 py-3 text-sm font-medium'
                                    )}
                                    passHref
                                >
                                    <item.icon
                                        className={clsx(
                                            {
                                                'stroke-2 text-primary':
                                                    pathname?.includes(
                                                        item.href
                                                    ),
                                                'text-white':
                                                    pathname === item.href,
                                            },
                                            'text-base-700 group-hover:text-black',
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
    )
}
