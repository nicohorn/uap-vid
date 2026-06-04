// AI suggestions for the Secretaría de Investigación checklist.
//
// "Modo orientativo": the AI proposes YES / NO / NOT_APPLICABLE / UNKNOWN
// for each item with a brief rationale, the secretary keeps the final call.
//
// We call the OpenAI REST API directly (no SDK) so this works regardless of
// whether `openai` is installed in node_modules. Uses JSON mode for parsing.

import { Protocol } from '@prisma/client'
import { CHECKLIST_ITEMS } from '@utils/secretary-checklist'

type AiResult = {
  key: string
  aiState: 'YES' | 'NO' | 'NOT_APPLICABLE' | 'UNKNOWN'
  aiRationale: string
}

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const DEFAULT_MODEL = 'gpt-4o-mini'

// Strip HTML/markdown so the model gets clean plain text.
const stripTags = (s: string | null | undefined): string =>
  (s ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

// Build a compact protocol summary the model can reason over. Truncate very
// long fields so we stay within token budget for the cheaper models.
const truncate = (s: string, max: number): string =>
  s.length > max ? `${s.slice(0, max)} […]` : s

const summarizeProtocol = (protocol: Protocol): string => {
  const s = protocol.sections as any
  const id = s?.identification ?? {}
  const desc = s?.description ?? {}
  const intro = s?.introduction ?? {}
  const pub = s?.publication ?? {}
  const duration = s?.duration ?? {}
  const budget = s?.budget ?? {}

  const team = (id?.team ?? [])
    .map(
      (m: any) =>
        `- ${m.name ?? '?'} ${m.last_name ?? ''} (${m.role ?? '?'}, ${m.hours ?? '?'}h/sem)${m.justification ? ' — ' + truncate(m.justification, 200) : ''}`
    )
    .join('\n')

  const schedule = (duration?.chronogram ?? [])
    .map(
      (sem: any) =>
        `  ${sem.semester ?? '?'}: ${(sem.data ?? []).map((t: any) => t.task).join('; ')}`
    )
    .join('\n')

  const bib = (s?.bibliography?.entries ?? [])
    .slice(0, 15)
    .map((e: any) => `- ${truncate(e.content ?? '', 200)}`)
    .join('\n')

  const expenses = (budget?.expenses ?? [])
    .map((cat: any) => {
      const lines = (cat?.data ?? [])
        .slice(0, 6)
        .map(
          (it: any) =>
            `    - ${truncate(it.detail ?? '', 120)} (x${it.amount ?? 1})`
        )
        .join('\n')
      return `  ${cat.type ?? 'Otros'}:\n${lines}`
    })
    .join('\n')

  return [
    `Título: ${id?.title ?? '(sin título)'}`,
    `Tipo de protocolo: ${protocol.protocolType}${protocol.protocolSubtype ? ` (${protocol.protocolSubtype})` : ''}`,
    `Carrera/curso ID: ${id?.careerId ?? '—'} / ${id?.courseId ?? '—'}`,
    '',
    'Equipo:',
    team || '  (vacío)',
    '',
    `Modalidad: ${duration?.modality ?? '—'}`,
    `Duración: ${duration?.duration ?? '—'}`,
    'Cronograma:',
    schedule || '  (vacío)',
    '',
    `Disciplina: ${desc?.discipline ?? '—'} | Línea: ${desc?.line ?? '—'}`,
    `Campo de aplicación: ${desc?.field ?? '—'}`,
    `Objetivo socioeconómico: ${desc?.objective ?? '—'}`,
    `Tipo de investigación: ${desc?.type ?? '—'}`,
    `Palabras clave: ${desc?.words ?? '—'}`,
    '',
    `Resumen técnico: ${truncate(stripTags(desc?.technical), 1200)}`,
    '',
    `Estado del arte: ${truncate(stripTags(intro?.stateOfTheArt), 1200)}`,
    `Justificación: ${truncate(stripTags(intro?.justification), 1200)}`,
    `Definición del problema: ${truncate(stripTags(intro?.problemDefinition), 1200)}`,
    `Objetivos: ${truncate(stripTags(intro?.objectives), 1200)}`,
    '',
    `Tipo de publicación: ${pub?.publicationType ?? '—'}`,
    `Plan de publicación: ${truncate(stripTags(pub?.publicationPlan), 800)}`,
    '',
    'Presupuesto:',
    expenses || '  (vacío)',
    '',
    'Bibliografía (primeras 15 entradas):',
    bib || '  (vacío)',
  ].join('\n')
}

const buildPrompt = (protocol: Protocol): { system: string; user: string } => {
  const items = CHECKLIST_ITEMS.map((i) =>
    `- ${i.key} | ${i.critical ? '[CRÍTICO] ' : ''}${i.label}${i.hint ? ` (${i.hint})` : ''}`
  ).join('\n')

  const system = [
    'Sos un asistente administrativo que ayuda a la Secretaría de Investigación de la UAP a revisar protocolos antes de enviarlos a evaluadores.',
    'Tu rol es SUGERIR — no decidir. La secretaria mantiene la decisión final.',
    'Para cada ítem del checklist analizá el protocolo y devolvé una de cuatro respuestas con una justificación breve (≤ 280 caracteres) en español:',
    '  - "YES": la evidencia en el protocolo respalda que el ítem está cumplido',
    '  - "NO": la evidencia indica que el ítem no está cumplido',
    '  - "NOT_APPLICABLE": el ítem no aplica a este protocolo',
    '  - "UNKNOWN": no podés determinar la respuesta a partir del protocolo',
    'Los ítems marcados [CRÍTICO] son excluyentes; si no encontrás evidencia clara, devolvé "NO" o "UNKNOWN" — NUNCA "NOT_APPLICABLE".',
    'No evalúes calidad científica, originalidad ni adecuación estadística — sólo cumplimiento administrativo/ético.',
  ].join('\n')

  const user = [
    'Checklist a completar (clave | etiqueta):',
    items,
    '',
    'Protocolo:',
    summarizeProtocol(protocol),
    '',
    'Devolvé un objeto JSON con la forma:',
    '{ "results": [ { "key": "...", "aiState": "YES|NO|NOT_APPLICABLE|UNKNOWN", "aiRationale": "..." }, ... ] }',
    'Incluí TODAS las claves listadas arriba, en el mismo orden.',
  ].join('\n')

  return { system, user }
}

export const requestChecklistSuggestions = async (
  protocol: Protocol
): Promise<AiResult[]> => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY no está configurada en el entorno. Avisá al administrador del sistema.'
    )
  }

  const { system, user } = buildPrompt(protocol)
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(
      `OpenAI respondió ${res.status}: ${detail.slice(0, 300) || 'sin detalle'}`
    )
  }

  const payload = await res.json()
  const raw = payload?.choices?.[0]?.message?.content
  if (typeof raw !== 'string') {
    throw new Error('Respuesta inesperada de OpenAI: sin contenido.')
  }

  let parsed: any
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    throw new Error('OpenAI devolvió un JSON inválido.')
  }

  const results: AiResult[] = Array.isArray(parsed?.results) ? parsed.results : []
  // Defensive: filter to known keys and valid states, trim rationale length.
  const validKeys = new Set(CHECKLIST_ITEMS.map((i) => i.key))
  const validStates = new Set(['YES', 'NO', 'NOT_APPLICABLE', 'UNKNOWN'])
  return results
    .filter(
      (r) =>
        typeof r?.key === 'string' &&
        validKeys.has(r.key) &&
        typeof r?.aiState === 'string' &&
        validStates.has(r.aiState) &&
        typeof r?.aiRationale === 'string'
    )
    .map((r) => ({
      key: r.key,
      aiState: r.aiState,
      aiRationale: r.aiRationale.slice(0, 280),
    }))
}
