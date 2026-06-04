'use client'

import { Button } from '@components/button'
import { Badge } from '@components/badge'
import { notifications } from '@elements/notifications'
import {
  getSecretaryChecklist,
  requestSecretaryChecklistAi,
  upsertSecretaryChecklistItems,
} from '@repositories/secretary-checklist'
import {
  CHECKLIST_CATEGORIES,
  type ChecklistCategory,
  type ChecklistState,
  itemsByCategory,
  type ChecklistItemDef,
} from '@utils/secretary-checklist'
import type { SecretaryChecklistItem } from '@utils/zod/secretary-checklist'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Checklist,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Robot,
  Stars,
  X,
} from 'tabler-icons-react'

// Stores per-protocol position so the panel reopens where the user left it.
const STORAGE_KEY = (protocolId: string) => `secretary-checklist-pos-${protocolId}`
const STORAGE_OPEN_KEY = (protocolId: string) =>
  `secretary-checklist-open-${protocolId}`

type StoredPos = { x: number; y: number }

const STATE_LABELS: Record<ChecklistState, string> = {
  YES: 'Sí',
  NO: 'No',
  NOT_APPLICABLE: 'N/A',
  PENDING: 'Pendiente',
}

const AI_LABELS: Record<string, string> = {
  YES: 'Sí',
  NO: 'No',
  NOT_APPLICABLE: 'N/A',
  UNKNOWN: 'No determinado',
}

// Map item-key → flat checklist item. Defaults missing items to PENDING so the
// UI is renderable even when the user opens it for the first time.
const buildItemMap = (
  items: SecretaryChecklistItem[]
): Map<string, SecretaryChecklistItem> => new Map(items.map((i) => [i.key, i]))

export function SecretaryChecklistPanel({
  protocolId,
}: {
  protocolId: string
}) {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [items, setItems] = useState<Map<string, SecretaryChecklistItem>>(
    new Map()
  )
  const [aiRequestedAt, setAiRequestedAt] = useState<Date | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<
    Set<ChecklistCategory>
  >(new Set(Object.keys(CHECKLIST_CATEGORIES) as ChecklistCategory[]))
  const [pos, setPos] = useState<StoredPos>({ x: 24, y: 96 })
  const panelRef = useRef<HTMLDivElement | null>(null)
  const dragOffsetRef = useRef<{ x: number; y: number } | null>(null)

  const categories = itemsByCategory()

  // Restore open + position from localStorage.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const storedOpen = window.localStorage.getItem(STORAGE_OPEN_KEY(protocolId))
      if (storedOpen === 'true') setOpen(true)
      const storedPos = window.localStorage.getItem(STORAGE_KEY(protocolId))
      if (storedPos) {
        const p = JSON.parse(storedPos) as StoredPos
        if (typeof p?.x === 'number' && typeof p?.y === 'number') setPos(p)
      }
    } catch {}
  }, [protocolId])

  // Persist open state.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_OPEN_KEY(protocolId), String(open))
    } catch {}
  }, [open, protocolId])

  // Fetch checklist when the panel opens (first time).
  useEffect(() => {
    if (!open || items.size > 0) return
    setLoading(true)
    getSecretaryChecklist(protocolId)
      .then((c) => {
        if (c) {
          setItems(buildItemMap(c.items))
          setAiRequestedAt(c.aiRequestedAt ?? null)
        }
      })
      .catch((e) => {
        notifications.show({
          title: 'Error al cargar checklist',
          message: (e as Error).message,
          intent: 'error',
        })
      })
      .finally(() => setLoading(false))
  }, [open, items.size, protocolId])

  const persistItem = useCallback(
    async (item: SecretaryChecklistItem) => {
      try {
        await upsertSecretaryChecklistItems(protocolId, [item])
      } catch (e) {
        notifications.show({
          title: 'Error al guardar',
          message: (e as Error).message,
          intent: 'error',
        })
      }
    },
    [protocolId]
  )

  const setState = (def: ChecklistItemDef, state: ChecklistState) => {
    const existing = items.get(def.key) ?? {
      key: def.key,
      state: 'PENDING' as ChecklistState,
      comment: null,
      aiState: null,
      aiRationale: null,
    }
    const updated: SecretaryChecklistItem = { ...existing, state }
    setItems((prev) => {
      const next = new Map(prev)
      next.set(def.key, updated)
      return next
    })
    void persistItem(updated)
  }

  const setComment = (def: ChecklistItemDef, comment: string) => {
    const existing = items.get(def.key) ?? {
      key: def.key,
      state: 'PENDING' as ChecklistState,
      comment: null,
      aiState: null,
      aiRationale: null,
    }
    const updated: SecretaryChecklistItem = { ...existing, comment }
    setItems((prev) => {
      const next = new Map(prev)
      next.set(def.key, updated)
      return next
    })
    // Debounced save — short window since this is a single field per item.
    if (commentTimers.current[def.key]) {
      clearTimeout(commentTimers.current[def.key])
    }
    commentTimers.current[def.key] = setTimeout(() => {
      void persistItem(updated)
    }, 600)
  }
  const commentTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const requestAi = async () => {
    setAiLoading(true)
    try {
      const result = await requestSecretaryChecklistAi(protocolId)
      setItems(buildItemMap(result.items))
      setAiRequestedAt(result.aiRequestedAt ?? new Date())
      notifications.show({
        title: 'Sugerencias generadas',
        message: 'Revisá las propuestas — la decisión final es tuya.',
        intent: 'success',
      })
    } catch (e) {
      notifications.show({
        title: 'Error al consultar la IA',
        message: (e as Error).message,
        intent: 'error',
      })
    } finally {
      setAiLoading(false)
    }
  }

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    if (!panelRef.current) return
    const rect = panelRef.current.getBoundingClientRect()
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
    e.preventDefault()
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragOffsetRef.current) return
      const newX = e.clientX - dragOffsetRef.current.x
      const newY = e.clientY - dragOffsetRef.current.y
      // Keep at least 80px inside the viewport on each side so the header
      // is always grabbable.
      const maxX = window.innerWidth - 80
      const maxY = window.innerHeight - 40
      setPos({
        x: Math.max(-200, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      })
    }
    const onUp = () => {
      if (dragOffsetRef.current) {
        try {
          window.localStorage.setItem(STORAGE_KEY(protocolId), JSON.stringify(pos))
        } catch {}
      }
      dragOffsetRef.current = null
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [pos, protocolId])

  const toggleCategory = (cat: ChecklistCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  // Stats for the header.
  const allItems = Object.values(categories).flat()
  const total = allItems.length
  const answered = allItems.filter((d) => {
    const i = items.get(d.key)
    return i && i.state !== 'PENDING'
  }).length
  const criticalMissing = allItems.filter((d) => {
    if (!d.critical) return false
    const i = items.get(d.key)
    return !i || i.state !== 'YES'
  }).length

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 print:hidden"
        title="Abrir checklist de Secretaría"
      >
        <Checklist className="size-5" />
        Checklist
        {criticalMissing > 0 && (
          <span className="ml-1 rounded-full bg-red-600 px-2 text-xs">
            {criticalMissing}
          </span>
        )}
      </button>
    )
  }

  return (
    <div
      ref={panelRef}
      style={{ left: pos.x, top: pos.y }}
      className="fixed z-50 flex w-[min(420px,90vw)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 print:hidden"
    >
      {/* Header — drag handle */}
      <div
        onMouseDown={onHeaderMouseDown}
        className="flex cursor-move items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
      >
        <GripVertical className="size-4 text-gray-400" />
        <div className="flex-1">
          <div className="text-sm font-semibold">Checklist de Secretaría</div>
          <div className="text-xs text-gray-500">
            {answered}/{total} respondidos
            {criticalMissing > 0 && (
              <span className="ml-2 text-red-600">
                · {criticalMissing} crítico{criticalMissing === 1 ? '' : 's'} sin OK
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="rounded p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
          title={collapsed ? 'Expandir' : 'Minimizar'}
        >
          {collapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Cerrar"
        >
          <X className="size-4" />
        </button>
      </div>

      {!collapsed && (
        <>
          {/* AI bar */}
          <div className="flex items-center gap-2 border-b border-gray-200 bg-blue-50 px-3 py-2 dark:border-gray-700 dark:bg-blue-950/30">
            <Stars className="size-4 text-blue-700 dark:text-blue-300" />
            <div className="flex-1 text-xs">
              <div className="font-medium text-blue-800 dark:text-blue-200">
                Sugerencias IA (modo orientativo)
              </div>
              <div className="text-blue-700/80 dark:text-blue-300/80">
                {aiRequestedAt
                  ? `Última corrida: ${new Date(aiRequestedAt).toLocaleString('es-AR')}`
                  : 'La decisión final es siempre tuya.'}
              </div>
            </div>
            <Button onClick={requestAi} disabled={aiLoading} color="light">
              <Robot data-slot="icon" />
              {aiLoading ? 'Analizando…' : 'Pedir sugerencias'}
            </Button>
          </div>

          {/* Body */}
          <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto p-3">
            {loading && (
              <div className="text-center text-sm text-gray-500">Cargando…</div>
            )}
            {(Object.keys(CHECKLIST_CATEGORIES) as ChecklistCategory[]).map(
              (cat) => {
                const catItems = categories[cat]
                const catAnswered = catItems.filter(
                  (d) => items.get(d.key)?.state && items.get(d.key)?.state !== 'PENDING'
                ).length
                const isExpanded = expandedCategories.has(cat)
                return (
                  <div
                    key={cat}
                    className="rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className="flex w-full items-center justify-between gap-2 rounded-t-lg bg-gray-50 px-3 py-2 text-left text-sm font-medium dark:bg-gray-800"
                    >
                      <span>{CHECKLIST_CATEGORIES[cat]}</span>
                      <span className="text-xs text-gray-500">
                        {catAnswered}/{catItems.length}
                        {isExpanded ? (
                          <ChevronUp className="ml-2 inline size-4" />
                        ) : (
                          <ChevronDown className="ml-2 inline size-4" />
                        )}
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="space-y-3 p-3">
                        {catItems.map((def) => {
                          const item = items.get(def.key)
                          const currentState =
                            (item?.state as ChecklistState) ?? 'PENDING'
                          return (
                            <div
                              key={def.key}
                              className={`rounded border p-2 ${def.critical ? 'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20' : 'border-gray-100 dark:border-gray-800'}`}
                            >
                              <div className="flex items-start gap-2">
                                <div className="flex-1 text-xs">
                                  {def.critical && (
                                    <Badge color="red" className="mb-1 !text-[10px]">
                                      Crítico
                                    </Badge>
                                  )}
                                  <div>{def.label}</div>
                                </div>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {(
                                  ['YES', 'NO', 'NOT_APPLICABLE', 'PENDING'] as ChecklistState[]
                                ).map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => setState(def, s)}
                                    className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${currentState === s ? stateButtonOn(s) : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                                  >
                                    {STATE_LABELS[s]}
                                  </button>
                                ))}
                              </div>
                              {item?.aiState && (
                                <div className="mt-2 rounded bg-blue-50 p-2 text-xs dark:bg-blue-950/30">
                                  <div className="flex items-center gap-1 font-medium text-blue-700 dark:text-blue-300">
                                    <Stars className="size-3" />
                                    IA sugiere:{' '}
                                    <Badge color={aiBadgeColor(item.aiState)} className="!text-[10px]">
                                      {AI_LABELS[item.aiState] ?? item.aiState}
                                    </Badge>
                                  </div>
                                  {item.aiRationale && (
                                    <div className="mt-1 text-blue-800/80 dark:text-blue-200/80">
                                      {item.aiRationale}
                                    </div>
                                  )}
                                </div>
                              )}
                              <textarea
                                placeholder="Comentario (opcional)"
                                value={item?.comment ?? ''}
                                onChange={(e) => setComment(def, e.target.value)}
                                rows={1}
                                className="mt-2 w-full rounded border border-gray-200 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }
            )}
          </div>
        </>
      )}
    </div>
  )
}

const stateButtonOn = (s: ChecklistState): string => {
  switch (s) {
    case 'YES':
      return 'bg-green-600 text-white'
    case 'NO':
      return 'bg-red-600 text-white'
    case 'NOT_APPLICABLE':
      return 'bg-gray-600 text-white'
    case 'PENDING':
      return 'bg-yellow-500 text-white'
  }
}

const aiBadgeColor = (s: string): 'green' | 'red' | 'gray' | 'yellow' => {
  if (s === 'YES') return 'green'
  if (s === 'NO') return 'red'
  if (s === 'NOT_APPLICABLE') return 'gray'
  return 'yellow'
}
