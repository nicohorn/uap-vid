import type { ReactNode } from 'react'

export default function ReviewContainer({
    title,
    children,
}: {
    title: string
    children: ReactNode
}) {
    return (
        <div className="max-h-[96svh] w-full overflow-auto rounded border bg-gray-50 py-3 transition-all lg:w-96 2xl:w-[30rem]">
            <h3 className="ml-2 text-lg font-semibold leading-10 text-gray-900">
                {title}
            </h3>
            {children}
        </div>
    )
}
