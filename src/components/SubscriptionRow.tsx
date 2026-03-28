import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Subscription } from '../types'
import { formatAmount, relativeDate, mediumDate, daysUntil } from '../lib/format'
import ServiceIcon from './ServiceIcon'

const DELETE_ACTION_WIDTH = 72
const SWIPE_THRESHOLD = 40

interface Props {
  subscription: Subscription
  onClick: () => void
  onDelete: () => void
  isDeleteOpen: boolean
  onDeleteOpenChange: (open: boolean) => void
  onReorderStart: (pointerId: number, clientY: number) => void
  onReorderMove: (pointerId: number, clientY: number) => void
  onReorderEnd: (pointerId: number) => void
  isDragging: boolean
  dragTranslateY?: number
}

type GestureMode = 'pending' | 'swipe' | 'scroll' | 'reorder' | null

export default function SubscriptionRow({
  subscription,
  onClick,
  onDelete,
  isDeleteOpen,
  onDeleteOpenChange,
  onReorderStart,
  onReorderMove,
  onReorderEnd,
  isDragging,
  dragTranslateY = 0,
}: Props) {
  const { t } = useTranslation()
  const { name, icon_key, amount, currency, next_billing, payment_channel } = subscription

  const countdown = relativeDate(next_billing, t)
  const dateStr = mediumDate(next_billing)
  const days = daysUntil(next_billing)
  const isOverdue = days < 0
  const isSoon = days >= 0 && days <= 7

  const [offset, setOffset] = useState(isDeleteOpen ? -DELETE_ACTION_WIDTH : 0)
  const [isSwiping, setIsSwiping] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const suppressClickRef = useRef(false)
  const gestureRef = useRef({
    pointerId: null as number | null,
    startX: 0,
    startY: 0,
    startOffset: 0,
    mode: null as GestureMode,
  })

  useEffect(() => {
    if (!isSwiping) {
      setOffset(isDeleteOpen ? -DELETE_ACTION_WIDTH : 0)
    }
  }, [isDeleteOpen, isSwiping])

  const revealProgress = useMemo(
    () => Math.min(1, Math.abs(offset) / DELETE_ACTION_WIDTH),
    [offset]
  )

  function resetGesture(pointerId?: number) {
    if (pointerId !== undefined && contentRef.current?.hasPointerCapture(pointerId)) {
      contentRef.current.releasePointerCapture(pointerId)
    }

    gestureRef.current = {
      pointerId: null,
      startX: 0,
      startY: 0,
      startOffset: 0,
      mode: null,
    }
    setIsSwiping(false)
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    const target = event.target as HTMLElement
    if (target.closest('[data-no-swipe]')) return

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: isDeleteOpen ? -DELETE_ACTION_WIDTH : 0,
      mode: 'pending',
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (gestureRef.current.pointerId !== event.pointerId) return

    const dx = event.clientX - gestureRef.current.startX
    const dy = event.clientY - gestureRef.current.startY

    if (gestureRef.current.mode === 'pending') {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return

      if (Math.abs(dx) > Math.abs(dy) + 2) {
        gestureRef.current.mode = 'swipe'
        contentRef.current?.setPointerCapture(event.pointerId)
        setIsSwiping(true)
      } else if (event.pointerType === 'mouse' && Math.abs(dy) > Math.abs(dx) + 2) {
        gestureRef.current.mode = 'reorder'
        contentRef.current?.setPointerCapture(event.pointerId)
        suppressClickRef.current = true
        onReorderStart(event.pointerId, event.clientY)
      } else {
        gestureRef.current.mode = 'scroll'
      }
    }

    if (gestureRef.current.mode === 'reorder') {
      event.preventDefault()
      suppressClickRef.current = true
      onReorderMove(event.pointerId, event.clientY)
      return
    }

    if (gestureRef.current.mode !== 'swipe') return

    event.preventDefault()
    suppressClickRef.current = true

    const rawOffset = gestureRef.current.startOffset + dx
    const nextOffset =
      rawOffset > 0
        ? rawOffset * 0.18
        : rawOffset < -DELETE_ACTION_WIDTH
          ? -DELETE_ACTION_WIDTH + (rawOffset + DELETE_ACTION_WIDTH) * 0.18
          : rawOffset

    setOffset(nextOffset)
  }

  function finalizeGesture(pointerId: number) {
    if (gestureRef.current.pointerId !== pointerId) return

    if (gestureRef.current.mode === 'swipe') {
      const shouldOpen = offset <= -SWIPE_THRESHOLD
      setOffset(shouldOpen ? -DELETE_ACTION_WIDTH : 0)
      onDeleteOpenChange(shouldOpen)
    }

    if (gestureRef.current.mode === 'reorder') {
      onReorderEnd(pointerId)
    }

    resetGesture(pointerId)
  }

  function handleActivate() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }

    if (isDeleteOpen) {
      onDeleteOpenChange(false)
      return
    }

    onClick()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleActivate()
    }
  }

  return (
    <div className={`relative ${isDragging ? 'opacity-55' : ''}`}>
      <div className="absolute inset-y-0 right-0 flex items-center justify-end pr-1.5">
        <button
          type="button"
          data-no-swipe
          aria-label={`Delete ${name}`}
          onClick={(event) => {
            event.stopPropagation()
            onDelete()
          }}
          className={`mac-button mac-button-danger flex h-[42px] w-[56px] items-center justify-center rounded-[12px] transition-[transform,opacity,box-shadow] duration-250 ${
            revealProgress > 0.05 ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
          style={{
            opacity: revealProgress,
            transform: `scale(${0.88 + revealProgress * 0.12})`,
            boxShadow: revealProgress > 0.4 ? '0 10px 18px rgba(120,24,24,0.22)' : 'none',
          }}
        >
          <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 3.75h6m-8 3h10m-8.25 2.5v7.5m6-7.5v7.5M8.25 20.25h7.5a1.5 1.5 0 0 0 1.5-1.5V6.75h-10.5v12a1.5 1.5 0 0 0 1.5 1.5Z" />
          </svg>
        </button>
      </div>

      <div
        ref={contentRef}
        role="button"
        tabIndex={0}
        aria-label={name}
        onClick={handleActivate}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => finalizeGesture(event.pointerId)}
        onPointerCancel={(event) => finalizeGesture(event.pointerId)}
        className="mac-list-row group relative z-10 flex items-center gap-2.5 px-2 py-1.5 text-left cursor-default"
        style={{
          transform: `translate3d(${offset}px, ${dragTranslateY}px, 0) scale(${isDragging ? 0.985 : 1})`,
          transition: isSwiping
            ? 'none'
            : 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 240ms ease, opacity 240ms ease',
          boxShadow: isDragging ? '0 12px 24px rgba(0,0,0,0.18)' : undefined,
        }}
      >
        <ServiceIcon iconKey={icon_key} name={name} large />

        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium leading-tight text-text-primary">{name}</div>
          {payment_channel && (
            <div className="mt-px truncate text-[11px] text-text-quaternary">{payment_channel}</div>
          )}
        </div>

        <div className="shrink-0 text-right">
          <div className="font-numeric text-[13px] font-semibold leading-tight text-text-primary">
            {formatAmount(amount, currency)}
          </div>
          <div className={`mt-px font-numeric text-[11px] ${
            isOverdue ? 'text-red-400' : isSoon ? 'text-accent' : 'text-text-quaternary'
          }`}>
            {countdown} · {dateStr}
          </div>
        </div>
      </div>
    </div>
  )
}
