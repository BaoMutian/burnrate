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
}

export default function SubscriptionList({ subscriptions, sortBy, onSortChange, onEdit }: Props) {
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showTopFade, setShowTopFade] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(false)

  const sorted = useMemo(() => {
    const items = [...subscriptions]
    if (sortBy === 'amount') {
      items.sort((a, b) => toMonthly(b.amount, b.cycle) - toMonthly(a.amount, a.cycle))
    } else {
      items.sort((a, b) => a.next_billing.localeCompare(b.next_billing))
    }
    return items
  }, [subscriptions, sortBy])

  const dueSoonCount = useMemo(() => {
    return subscriptions.filter((sub) => {
      const days = daysUntil(sub.next_billing)
      return days >= 0 && days <= 7
    }).length
  }, [subscriptions])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    function checkScroll() {
      if (!el) return
      setShowTopFade(el.scrollTop > 4)
      setShowBottomFade(el.scrollTop < el.scrollHeight - el.clientHeight - 4)
    }

    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    return () => el.removeEventListener('scroll', checkScroll)
  }, [sorted.length])

  if (subscriptions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-6 gap-1.5">
        <div className="w-8 h-8 rounded-[var(--radius-item)] bg-bg-secondary border border-border flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <span className="text-text-tertiary text-lg">+</span>
        </div>
        <div className="text-center">
          <div className="text-text-secondary text-[11px]">{t('list.empty')}</div>
          <div className="text-text-tertiary text-[9px] mt-0.5">{t('list.addFirst')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Due soon header + sort toggle */}
      <div className="flex items-center justify-between px-3 pt-0.5 pb-0.5">
        {dueSoonCount > 0 ? (
          <span className="text-[10px] font-medium text-accent/70">
            {t('list.dueSoon', { count: dueSoonCount })}
          </span>
        ) : (
          <span />
        )}
        <button
          onClick={() => onSortChange(sortBy === 'next_billing' ? 'amount' : 'next_billing')}
          className="mac-button mac-button-quiet px-1 text-[9px] text-text-quaternary cursor-default tracking-wide"
        >
          {sortBy === 'next_billing' ? t('list.sortByDate') : t('list.sortByAmount')}
        </button>
      </div>

      {/* Scrollable list */}
      <div className="relative flex-1 min-h-0">
        {showTopFade && (
          <div className="absolute top-0 left-0 right-0 h-5 bg-gradient-to-b from-bg-primary to-transparent z-10 pointer-events-none" />
        )}

        <div ref={scrollRef} className="h-full overflow-y-auto px-0.5">
          {sorted.map((sub) => (
            <SubscriptionRow
              key={sub.id}
              subscription={sub}
              onClick={() => onEdit(sub)}
            />
          ))}
        </div>

        {showBottomFade && (
          <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-bg-primary to-transparent z-10 pointer-events-none" />
        )}
      </div>
    </div>
  )
}
