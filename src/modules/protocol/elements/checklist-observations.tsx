import { Badge } from '@components/badge'
import { getChecklistObservationsForOwner } from '@repositories/secretary-checklist'
import type { ChecklistObservation } from '@repositories/secretary-checklist'

/**
 * Read-only card shown to the protocol owner with the checklist items the
 * secretary flagged (answered "NO" or commented). This is the researcher-facing
 * half of the secretary checklist: it tells the researcher what to correct
 * when the protocol is sent back.
 */
export async function ChecklistObservations({
  protocolId,
}: {
  protocolId: string
}) {
  const observations = await getChecklistObservationsForOwner(protocolId)
  if (observations.length === 0) return null

  const byCategory = new Map<string, ChecklistObservation[]>()
  for (const obs of observations) {
    const list = byCategory.get(obs.category) ?? []
    list.push(obs)
    byCategory.set(obs.category, list)
  }

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30 print:hidden">
      <div className="mb-1 text-sm font-semibold text-amber-900 dark:text-amber-100">
        Observaciones de la Secretaría de Investigación
      </div>
      <div className="mb-3 text-xs text-amber-800 dark:text-amber-200">
        La secretaría marcó los siguientes puntos durante la revisión del
        proyecto. Revisalos y realizá las correcciones correspondientes.
      </div>
      <div className="space-y-3">
        {Array.from(byCategory.entries()).map(([category, items]) => (
          <div key={category}>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-900/70 dark:text-amber-100/70">
              {category}
            </div>
            <ul className="space-y-2">
              {items.map((obs) => (
                <li
                  key={obs.key}
                  className="rounded border border-amber-200 bg-white p-2 text-xs dark:border-amber-900/50 dark:bg-gray-900"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">{obs.label}</div>
                    {obs.state === 'NO' && <Badge color="red">No cumple</Badge>}
                  </div>
                  {obs.comment && (
                    <div className="mt-1 whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                      {obs.comment}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
