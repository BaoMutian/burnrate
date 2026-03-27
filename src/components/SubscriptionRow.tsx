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

  const isOverdue = countdown === t('time.overdue')
  const isSoon = countdown === t('time.today') || countdown === t('time.tomorrow')

  return (
    <button
      onClick={onClick}
      className="mac-list-row group w-full flex items-center gap-2 px-2.5 py-1.5 text-left cursor-default"
    >
      <ServiceIcon iconKey={icon_key} name={name} />

      {/* Name + payment info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-medium text-text-primary truncate">{name}</span>
          {tier && (
            <span className="text-[9px] leading-none px-1.5 py-[2px] rounded-full bg-accent-dim text-accent font-medium shrink-0 tracking-wide uppercase">
              {tier}
            </span>
          )}
        </div>
        {payment_channel && (
          <div className="text-[10px] text-text-tertiary truncate mt-0.5">{payment_channel}</div>
        )}
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <div className="flex items-baseline gap-0.5">
          {isYearly && monthlyEquiv ? (
            <span className="text-[12px] font-numeric text-text-secondary">
              ≈{monthlyEquiv}<span className="text-[9px] text-text-tertiary">/mo</span>
            </span>
          ) : (
            <span className="text-[12px] font-numeric text-text-primary">
              {displayAmount}<span className="text-[9px] text-text-tertiary">{cycleLabel}</span>
            </span>
          )}
        </div>
        {isYearly && (
          <div className="text-[9px] font-numeric text-text-quaternary mt-0.5">
            {displayAmount}/yr
          </div>
        )}
      </div>

      {/* Countdown */}
      <div className="text-right shrink-0 ml-0.5 min-w-[36px]">
        <div className={`text-[10px] font-numeric font-medium ${
          isOverdue ? 'text-red-400' : isSoon ? 'text-accent' : 'text-text-secondary'
        }`}>
          {countdown}
        </div>
        <div className="text-[9px] font-numeric text-text-quaternary mt-0.5">
          {dueDateStr} {t('time.due')}
        </div>
      </div>
    </button>
  )
}
