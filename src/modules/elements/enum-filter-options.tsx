import React from 'react'
import { Button } from './button'
import { useSearchParams } from 'next/navigation'
import { useUpdateQuery } from '@utils/query-helper/updateQuery'
import { Badge } from './badge'
import { cx } from '@utils/cx'

export default function EnumFilterOptions({
    filter,
    values,
}: {
    filter: string
    values: string[][]
}) {
    const update = useUpdateQuery()
    const searchParams = useSearchParams()
    const currentValues = searchParams.get('values')?.split('-')
    return (
        <div>
            <div className="relative mt-4 flex flex-col items-start text-sm">
                <div className="relative flex gap-2">
                    <div className="flex gap-2">
                        {values.map(([value, name], i) => {
                            return (
                                <Button
                                    onClick={() => {
                                        update({
                                            filter,
                                            values: currentValues
                                                ? currentValues.includes(value)
                                                    ? currentValues
                                                          .filter(
                                                              (e) => e !== value
                                                          )
                                                          .join('-')
                                                    : currentValues
                                                          .join('-')
                                                          .concat('-', value)
                                                : value,
                                        })
                                    }}
                                    intent="unset"
                                    key={i}
                                >
                                    <Badge
                                        className={cx(
                                            'cursor-pointer hover:bg-gray-100',
                                            currentValues?.includes(value) &&
                                                'bg-gray-200 ring-gray-500/20'
                                        )}
                                    >
                                        {name}
                                    </Badge>
                                </Button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
