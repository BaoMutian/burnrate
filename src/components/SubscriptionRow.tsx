import { useTranslation } from 'react-i18next'
import type { Subscription } from '../types'
import { formatAmount, toMonthly, relativeDate, shortDate } from '../lib/format'
import ServiceIcon from './ServiceIcon'

interface Props {
  subscription: Subscription
  onClick: () => void
}

export default function SubscriptionRow({ subscription, onClick }: Props) {
  const { t } = useTranslation()
  const { name, icon_key, amount, currency, cycle, tier, next_billing, payment_channel } = subscription

  const isYearly = cycle === 'yearly'
  const displayAmount = formatAmount(amount, currency)
  const monthlyEquiv = isYearly ? formatAmount(toMonthly(amount, cycle), currency) : null
  const countdown = relativeDate(next_billing, t)
  const dueDateStr = shortDate(next_billing)

  const cycleLabel = cycle === 'monthly' ? '/mo' : cycle === 'yearly' ? '/yr' : '/wk'

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-bg-secondary transition-colors text-left cursor-default"
    >
      <ServiceIcon iconKey={icon_key} name={name} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-text-primary truncate">{name}</span>
          {tier && (
            <span className="text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-bg-tertiary text-text-secondary shrink-0">
              {tier}
            </span>
          )}
        </div>
        {payment_channel && (
          <div className="text-xs text-text-tertiary truncate">{payment_channel}</div>
        )}
      </div>

      <div className="text-right shrink-0">
        <div className="flex items-baseline gap-0.5">
          {isYearly && monthlyEquiv ? (
            <span className="text-sm font-mono text-text-secondary">
              ≈{monthlyEquiv}<span className="text-xs text-text-tertiary">/mo</span>
            </span>
          ) : (
            <span className="text-sm font-mono text-text-primary">
              {displayAmount}<span className="text-xs text-text-tertiary">{cycleLabel}</span>
            </span>
          )}
        </div>
        {isYearly && (
          <div className="text-xs font-mono text-text-tertiary">
            {displayAmount}/yr
          </div>
        )}
      </div>

      <div className="text-right shrink-0 ml-2">
        <div className="text-xs font-mono text-text-secondary">{countdown}</div>
        <div className="text-[10px] font-mono text-text-quaternary">{dueDateStr} {t('time.due')}</div>
      </div>
    </button>
  )
}
