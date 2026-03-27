import { useTranslation } from 'react-i18next'
import type { Subscription } from '../types'
import { formatAmount, relativeDate, mediumDate, daysUntil } from '../lib/format'
import ServiceIcon from './ServiceIcon'

interface Props {
  subscription: Subscription
  onClick: () => void
}

export default function SubscriptionRow({ subscription, onClick }: Props) {
  const { t } = useTranslation()
  const { name, icon_key, amount, currency, next_billing, payment_channel } = subscription

  const countdown = relativeDate(next_billing, t)
  const dateStr = mediumDate(next_billing)
  const days = daysUntil(next_billing)

  const isOverdue = days < 0
  const isSoon = days >= 0 && days <= 7

  return (
    <button
      onClick={onClick}
      className="mac-list-row group w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left cursor-default"
    >
      <ServiceIcon iconKey={icon_key} name={name} large />

      {/* Name + payment info */}
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-text-primary truncate leading-tight">{name}</div>
        {payment_channel && (
          <div className="text-[10px] text-text-quaternary truncate mt-px">{payment_channel}</div>
        )}
      </div>

      {/* Amount + countdown */}
      <div className="text-right shrink-0">
        <div className="text-[12px] font-semibold font-numeric text-text-primary leading-tight">
          {formatAmount(amount, currency)}
        </div>
        <div className={`text-[10px] font-numeric mt-px ${
          isOverdue ? 'text-red-400' : isSoon ? 'text-accent' : 'text-text-quaternary'
        }`}>
          {countdown} · {dateStr}
        </div>
      </div>
    </button>
  )
}
