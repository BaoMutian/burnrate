import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Subscription, Settings } from '../types'
import SubscriptionRow from './SubscriptionRow'
import { toMonthly } from '../lib/format'

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
      <div className="flex-1 flex flex-col items-center justify-center py-8 gap-2">
        <div className="w-8 h-8 rounded-lg bg-bg-secondary border border-border flex items-center justify-center">
          <span className="text-text-quaternary text-sm">+</span>
        </div>
        <span className="text-text-tertiary text-xs">{t('list.empty')}</span>
        <span className="text-text-quaternary text-[10px]">{t('list.addFirst')}</span>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Sort toggle */}
      <div className="flex items-center justify-end px-3.5 pb-1">
        <button
          onClick={() => onSortChange(sortBy === 'next_billing' ? 'amount' : 'next_billing')}
          className="text-[9px] text-text-quaternary hover:text-text-tertiary transition-colors cursor-default tracking-wider uppercase font-medium"
        >
          {sortBy === 'next_billing' ? t('list.sortByDate') : t('list.sortByAmount')}
        </button>
      </div>

      {/* Scrollable list */}
      <div className="relative flex-1 min-h-0">
        {showTopFade && (
          <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-bg-primary to-transparent z-10 pointer-events-none" />
        )}

        <div ref={scrollRef} className="h-full overflow-y-auto">
          {sorted.map((sub) => (
            <SubscriptionRow
              key={sub.id}
              subscription={sub}
              onClick={() => onEdit(sub)}
            />
          ))}
        </div>

        {showBottomFade && (
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-bg-primary to-transparent z-10 pointer-events-none" />
        )}
      </div>
    </div>
  )
}
