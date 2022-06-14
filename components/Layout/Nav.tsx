/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { MenuIcon, UserIcon, XIcon } from '@heroicons/react/outline'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { navigation } from '../../config/navigation'
import { Button } from '../Atomic/Button'
import UserAuth from './UserAuth'
import { useSession } from 'next-auth/react'

function classNames(...classes: any) {
    return classes.filter(Boolean).join(' ')
}

export default function Example() {
    return (
        <nav className="w-screen  bg-primary">
            <div className="mx-20 flex h-28 max-w-[1280px] items-center justify-between text-white 2xl:m-auto">
                <div className="text-center text-[10px] uppercase tracking-wider transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]">
                    <a href="/protected/">
                        <img src="/UAP-logo-home.png"></img>
                        <p>Vicerrectoría de Investigación y Desarrollo</p>
                    </a>
                </div>
                <div className="flex items-center gap-2">
                    <UserAuth />
                </div>
            </div>
        </nav>
    )
}
