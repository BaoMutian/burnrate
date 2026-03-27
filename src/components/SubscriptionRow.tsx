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

  // Countdown color: overdue = red, today/tomorrow = amber, else default
  const isOverdue = countdown === t('time.overdue')
  const isSoon = countdown === t('time.today') || countdown === t('time.tomorrow')

  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-3 px-5 py-3 hover:bg-bg-secondary/60 transition-all duration-150 text-left cursor-default relative"
    >
      {/* Hover accent bar */}
      <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-accent opacity-0 group-hover:opacity-40 transition-opacity duration-150" />

      <ServiceIcon iconKey={icon_key} name={name} />

      {/* Name + payment info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-medium text-text-primary truncate">{name}</span>
          {tier && (
            <span className="text-[9px] leading-none px-1.5 py-[3px] rounded-full bg-accent-dim text-accent font-medium shrink-0 tracking-wide uppercase">
              {tier}
            </span>
          )}
        </div>
        {payment_channel && (
          <div className="text-[11px] text-text-tertiary truncate mt-0.5">{payment_channel}</div>
        )}
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <div className="flex items-baseline gap-0.5">
          {isYearly && monthlyEquiv ? (
            <span className="text-[13px] font-mono text-text-secondary">
              ≈{monthlyEquiv}<span className="text-[10px] text-text-tertiary">/mo</span>
            </span>
          ) : (
            <span className="text-[13px] font-mono text-text-primary">
              {displayAmount}<span className="text-[10px] text-text-tertiary">{cycleLabel}</span>
            </span>
          )}
        </div>
        {isYearly && (
          <div className="text-[10px] font-mono text-text-quaternary mt-0.5">
            {displayAmount}/yr
          </div>
        )}
      </div>

      {/* Countdown */}
      <div className="text-right shrink-0 ml-1 min-w-[44px]">
        <div className={`text-[11px] font-mono font-medium ${
          isOverdue ? 'text-red-400' : isSoon ? 'text-accent' : 'text-text-secondary'
        }`}>
          {countdown}
        </div>
        <div className="text-[10px] font-mono text-text-quaternary mt-0.5">
          {dueDateStr} {t('time.due')}
        </div>
      </div>
    </button>
  )
}
