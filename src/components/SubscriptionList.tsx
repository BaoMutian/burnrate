import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Subscription, Settings } from '../types'
import SubscriptionRow from './SubscriptionRow'
import { toMonthly, daysUntil } from '../lib/format'

interface Props {
  subscriptions: Subscription[]
  sortBy: Settings['sort_by']
  onSortChange: (sort: Settings['sort_by']) => void
  onEdit: (sub: Subscription) => void
  onDelete: (sub: Subscription) => void
  onReorder: (orderedIds: string[]) => void | Promise<void>
  maxHeight?: number
}

const SORT_SEQUENCE: Settings['sort_by'][] = ['manual', 'next_billing', 'amount']

function moveId(ids: string[], draggingId: string, targetId: string, position: 'before' | 'after') {
  const next = ids.filter((id) => id !== draggingId)
  const targetIndex = next.indexOf(targetId)
  if (targetIndex < 0) return ids

  const insertionIndex = position === 'before' ? targetIndex : targetIndex + 1
  next.splice(insertionIndex, 0, draggingId)
  return next
}

function getPreviewOffset(
  id: string,
  sortedIds: string[],
  projectedIds: string[],
  rowHeight: number
) {
  const currentIndex = sortedIds.indexOf(id)
  const projectedIndex = projectedIds.indexOf(id)

  if (currentIndex < 0 || projectedIndex < 0 || currentIndex === projectedIndex) {
    return 0
  }

  return (projectedIndex - currentIndex) * rowHeight
}

export default function SubscriptionList({
  subscriptions,
  sortBy,
  onSortChange,
  onEdit,
  onDelete,
  onReorder,
  maxHeight,
}: Props) {
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef(new Map<string, HTMLDivElement>())
  const [showTopFade, setShowTopFade] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(false)
  const [dragState, setDragState] = useState<{ id: string; pointerId: number; startY: number; currentY: number; startScrollTop: number; currentScrollTop: number; rowHeight: number } | null>(null)
  const [dropTarget, setDropTarget] = useState<{ id: string; position: 'before' | 'after' } | null>(null)
  const [openDeleteId, setOpenDeleteId] = useState<string | null>(null)

  const sorted = useMemo(() => {
    const items = [...subscriptions]

    if (sortBy === 'manual') {
      items.sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at))
      return items
    }

    if (sortBy === 'amount') {
      items.sort((a, b) => toMonthly(b.amount, b.cycle) - toMonthly(a.amount, a.cycle))
      return items
    }

    items.sort((a, b) => a.next_billing.localeCompare(b.next_billing))
    return items
  }, [subscriptions, sortBy])

  const dueSoonCount = useMemo(() => {
    return subscriptions.filter((sub) => {
      const days = daysUntil(sub.next_billing)
      return days >= 0 && days <= 7
    }).length
  }, [subscriptions])

  const sortLabel = sortBy === 'manual'
    ? t('list.sortManual')
    : sortBy === 'amount'
      ? t('list.sortByAmount')
      : t('list.sortByDate')

  const sortedIds = useMemo(() => sorted.map((sub) => sub.id), [sorted])

  const projectedIds = useMemo(() => {
    if (!dragState || !dropTarget) return sortedIds
    return moveId(sortedIds, dragState.id, dropTarget.id, dropTarget.position)
  }, [dragState, dropTarget, sortedIds])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    function checkScroll() {
      const current = scrollRef.current
      if (!current) return
      setShowTopFade(current.scrollTop > 4)
      setShowBottomFade(current.scrollTop < current.scrollHeight - current.clientHeight - 4)
    }

    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    return () => el.removeEventListener('scroll', checkScroll)
  }, [sorted.length])

  useEffect(() => {
    if (!openDeleteId || sorted.some((sub) => sub.id === openDeleteId)) return

    const frame = requestAnimationFrame(() => setOpenDeleteId(null))
    return () => cancelAnimationFrame(frame)
  }, [sorted, openDeleteId])

  useEffect(() => {
    if (!dragState || sorted.some((sub) => sub.id === dragState.id)) return

    const frame = requestAnimationFrame(() => {
      setDragState(null)
      setDropTarget(null)
    })
    return () => cancelAnimationFrame(frame)
  }, [sorted, dragState])

  function cycleSort() {
    const currentIndex = SORT_SEQUENCE.indexOf(sortBy)
    const nextSort = SORT_SEQUENCE[(currentIndex + 1) % SORT_SEQUENCE.length]
    setOpenDeleteId(null)
    onSortChange(nextSort)
  }

  function getDropTarget(draggingId: string, clientY: number) {
    const candidates = sorted
      .filter((sub) => sub.id !== draggingId)
      .map((sub) => {
        const rect = rowRefs.current.get(sub.id)?.getBoundingClientRect()
        return rect ? { id: sub.id, rect } : null
      })
      .filter((row): row is { id: string; rect: DOMRect } => row !== null)

    for (const row of candidates) {
      const midpoint = row.rect.top + row.rect.height / 2
      if (clientY < midpoint) {
        return { id: row.id, position: 'before' as const }
      }
    }

    const last = candidates.at(-1)
    return last ? { id: last.id, position: 'after' as const } : null
  }

  async function commitReorder(state: { id: string; pointerId: number; startY: number; currentY: number; rowHeight: number }) {
    const target = dropTarget
    setDragState(null)
    setDropTarget(null)
    setOpenDeleteId(null)

    if (!target) return

    const orderedIds = moveId(sortedIds, state.id, target.id, target.position)
    const hasChanged = orderedIds.some((id, index) => id !== sorted[index]?.id)
    if (!hasChanged) return

    if (sortBy !== 'manual') {
      onSortChange('manual')
    }

    await onReorder(orderedIds)
  }

  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pt-5 pb-6">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true" className="mb-3 opacity-25">
          <rect x="4" y="7" width="28" height="22" rx="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 13h28" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8.5" cy="10" r="1" fill="currentColor" />
          <circle cx="12" cy="10" r="1" fill="currentColor" />
          <circle cx="15.5" cy="10" r="1" fill="currentColor" />
          <path d="M14 22h8M18 18v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <div className="text-text-tertiary text-[12px] text-center leading-relaxed">
          {t('list.empty')}
        </div>
        <div className="text-text-quaternary text-[11px] mt-1 text-center">
          {t('list.emptyHint')}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-3 pt-0.5 pb-0.5">
        {dueSoonCount > 0 ? (
          <span className="text-[11px] font-medium text-accent/70">
            {t('list.dueSoon', { count: dueSoonCount })}
          </span>
        ) : (
          <span />
        )}
        <button
          onClick={cycleSort}
          className="mac-button mac-button-quiet px-1.5 text-[11px] text-text-quaternary cursor-default tracking-wide"
        >
          {sortLabel}
        </button>
      </div>

      <div className="relative">
        {showTopFade && (
          <div className="absolute top-0 left-0 right-0 h-5 bg-gradient-to-b from-bg-primary to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          className="overflow-y-auto px-1.5 pb-3"
          style={maxHeight ? { maxHeight: `${maxHeight}px` } : undefined}
          onScroll={(event) => {
            setOpenDeleteId(null)
            if (dragState) {
              const currentScrollTop = event.currentTarget.scrollTop
              setDragState((prev) => prev && ({ ...prev, currentScrollTop }))
              setDropTarget(getDropTarget(dragState.id, dragState.currentY))
            }
          }}
        >
          {sorted.map((sub) => {
            const indicator = dropTarget?.id === sub.id ? dropTarget.position : null
            const isDragging = dragState?.id === sub.id
            const previewOffset = !isDragging && dragState
              ? getPreviewOffset(sub.id, sortedIds, projectedIds, dragState.rowHeight)
              : 0

            return (
              <div
                key={sub.id}
                className="relative transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  transform: previewOffset === 0 ? undefined : `translate3d(0, ${previewOffset}px, 0)`,
                }}
                ref={(node) => {
                  if (node) {
                    rowRefs.current.set(sub.id, node)
                  } else {
                    rowRefs.current.delete(sub.id)
                  }
                }}
              >
                {indicator === 'before' && (
                  <div className="absolute left-3 right-3 top-0 z-20 h-[2px] rounded-full bg-accent shadow-[0_0_12px_rgba(232,168,56,0.22)]" />
                )}

                <SubscriptionRow
                  subscription={sub}
                  onClick={() => {
                    setOpenDeleteId(null)
                    onEdit(sub)
                  }}
                  onDelete={() => {
                    setOpenDeleteId(null)
                    onDelete(sub)
                  }}
                  isDeleteOpen={openDeleteId === sub.id}
                  onDeleteOpenChange={(open) => setOpenDeleteId(open ? sub.id : null)}
                  isDragging={Boolean(isDragging)}
                  dragTranslateY={isDragging ? dragState.currentY - dragState.startY + dragState.currentScrollTop - dragState.startScrollTop : 0}
                  onReorderStart={(pointerId, clientY) => {
                    setOpenDeleteId(null)
                    const currentScrollTop = scrollRef.current?.scrollTop ?? 0
                    const rowHeight = rowRefs.current.get(sub.id)?.getBoundingClientRect().height ?? 52
                    setDragState({ id: sub.id, pointerId, startY: clientY, currentY: clientY, startScrollTop: currentScrollTop, currentScrollTop, rowHeight })
                    setDropTarget(null)
                  }}
                  onReorderMove={(pointerId, clientY) => {
                    setDragState((current) => {
                      if (!current || current.pointerId !== pointerId || current.id !== sub.id) return current
                      return { ...current, currentY: clientY }
                    })
                    setDropTarget(getDropTarget(sub.id, clientY))
                  }}
                  onReorderEnd={(pointerId) => {
                    const current = dragState
                    if (!current || current.pointerId !== pointerId || current.id !== sub.id) return
                    void commitReorder(current)
                  }}
                />

                {indicator === 'after' && (
                  <div className="absolute left-3 right-3 bottom-0 z-20 h-[2px] rounded-full bg-accent shadow-[0_0_12px_rgba(232,168,56,0.22)]" />
                )}
              </div>
            )
          })}
        </div>

        {showBottomFade && (
          <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-bg-primary to-transparent z-10 pointer-events-none" />
        )}
      </div>
    </div>
  )
}
