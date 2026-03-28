import { useMemo } from 'react'
import type { Subscription } from '../types'
import { type ExchangeRates } from '../lib/currency'
import { getCategoryTotals } from '../lib/categories'

interface Props {
  subscriptions: Subscription[]
  displayCurrency: string
  exchangeRates: ExchangeRates | null
}

export default function CategoryBar({ subscriptions, displayCurrency, exchangeRates }: Props) {
  const categories = useMemo(
    () => getCategoryTotals(subscriptions, displayCurrency, exchangeRates),
    [subscriptions, displayCurrency, exchangeRates]
  )

  const total = categories.reduce((sum, c) => sum + c.amount, 0)
  if (total === 0) return null

  return (
    <div className="px-3 pt-1 pb-1.5">
      {/* Stacked bar */}
      <div className="flex h-[4px] rounded-full overflow-hidden gap-[1.5px]">
        {categories.map((cat) => (
          <div
            key={cat.key}
            style={{
              width: `${(cat.amount / total) * 100}%`,
              backgroundColor: cat.color,
              opacity: 0.8,
            }}
            className="rounded-full min-w-[3px]"
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-2.5 gap-y-0 mt-1">
        {categories.map((cat) => (
          <div key={cat.key} className="flex items-center gap-0.5">
            <div
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-[11px] text-text-quaternary">
              {cat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
