'use client'
import { motion } from 'framer-motion'
import { useProtocolContext } from 'utils/createContext'
import Textarea from '@protocol/elements/Textarea'
import Select from '@protocol/elements/Select'
import SectionTitle from '@protocol/elements/SectionTitle'

const types = [
    'Investigaciones cuantitativas, cualitativas, mixtas o experimentales',
    'Investigaciones de tipo teóricas',
]
const conditionalByType = (v: string, path: any) => {
    if (
        v ===
        'Investigaciones cuantitativas, cualitativas, mixtas o experimentales'
    )
        return (
            <>
                <Textarea
                    path={path}
                    x="design"
                    label="Diseño y tipo de investigación"
                />
                <Textarea path={path} x="participants" label="Participantes" />
                <Textarea path={path} x="place" label="Lugar de desarrollo" />
                <Textarea
                    path={path}
                    x="instruments"
                    label="Instrumentos para recolección de datos"
                />
                <Textarea
                    path={path}
                    x="procedures"
                    label="Procedimientos para recolección de datos"
                />
                <Textarea path={path} x="analysis" label="Análisis de datos" />
                <Textarea
                    path={path}
                    x="considerations"
                    label="Consideraciones"
                />
            </>
        )
    if (v === 'Investigaciones de tipo teóricas')
        return (
            <>
                <Textarea
                    path={path}
                    x="detail"
                    label="Detalle de metodología"
                />
            </>
        )
}

export default function Method() {
    const form = useProtocolContext()
    const path = 'sections.methodology.'

    return (
        <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-3"
        >
            <SectionTitle title="Metodología" />
            <span />
            <>
                <Select
                    path={path}
                    x="type"
                    options={types}
                    label="tipo de investigación"
                />
                {conditionalByType(form.values.sections.methodology.type, path)}
            </>
        </motion.div>
    )
}
