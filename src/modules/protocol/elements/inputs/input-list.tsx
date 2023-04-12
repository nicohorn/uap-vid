import type { PropsWithChildren } from 'react'
import Input from './input'
import Select from './select'
import { Plus, Trash } from 'tabler-icons-react'
import CurrencyInput from './currency-input'
import { useProtocolContext } from '@utils/createContext'
import { Button } from '@elements/button'
import NumberInput from './number-input'

type Header = {
    x: string
    label: string
    options?: string[]
    class?: string
    currency?: boolean
    number?: boolean
}

export function InputList({
    path,
    label,
    headers,
    insertedItemFormat,
}: PropsWithChildren<{
    path: string
    label: string
    headers: Header[]
    insertedItemFormat: { [key: string]: string | number }
}>) {
    const form = useProtocolContext()

    const fields = form
        .getInputProps(path)
        .value.map((_: { [key: string]: string | number }, index: number) => (
            <div
                key={index}
                id={`row-${index}`}
                className="flex w-full items-start justify-around gap-2"
            >
                {headers.map((h: Header, i: number) => (
                    <div className={` ${h.class}`} key={i}>
                        {h.options ? (
                            <Select
                                options={h.options}
                                path={path + `.${index}.` + h.x}
                                label={h.label}
                            />
                        ) : h.currency ? (
                            <CurrencyInput
                                path={path + `.${index}.` + h.x}
                                label={h.label}
                            />
                        ) : h.number ? (
                            <NumberInput
                                path={path + `.${index}.` + h.x}
                                label={h.label}
                            />
                        ) : (
                            <Input
                                path={path + `.${index}.` + h.x}
                                label={h.label}
                            />
                        )}
                    </div>
                ))}

                <Trash
                    onClick={() => form.removeListItem(path, index)}
                    className={`mt-[2.2rem] h-5 flex-shrink cursor-pointer self-start text-primary hover:text-base-400 active:scale-[0.90] ${
                        index == 0 ? 'pointer-events-none invisible' : ''
                    }`}
                />
            </div>
        ))

    return (
        <div>
            <div className="label text-center">{label}</div>
            <div className="space-y-3 rounded-xl border px-4 pb-2 pt-6">
                {fields.length === 0 ? (
                    <div className="label text-center text-primary">
                        La lista esta vacía ...
                    </div>
                ) : null}
                {fields}
                {form.getInputProps(path).error ? (
                    <p className=" pl-3 pt-1 text-xs text-gray-600 saturate-[80%]">
                        *{form.getInputProps(path).error}
                    </p>
                ) : null}
                <Button
                    onClick={() => {
                        form.insertListItem(path, insertedItemFormat)
                        /* Esto es una chanchada, habría que mejorarlo*/
                        setTimeout(() => {
                            document
                                .getElementById(`row-${fields.length}`)
                                ?.getElementsByTagName('input')[0]
                                .focus()
                        }, 10)
                    }}
                    intent="secondary"
                    className="mx-auto w-full max-w-xs"
                >
                    <p> Añadir otra fila </p>
                    <Plus className="h-5" />
                </Button>
            </div>
        </div>
    )
}
