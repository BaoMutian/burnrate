import { useTranslation } from 'react-i18next'
import { formatAmount } from '../lib/format'

interface Props {
  monthlyTotal: number
  yearlyTotal: number
  activeCount: number
  currency: string
  ratesLoading?: boolean
}

export default function OverviewRow({ monthlyTotal, yearlyTotal, activeCount, currency, ratesLoading }: Props) {
  const { t } = useTranslation()

  return (
    <div className="px-4 pt-3.5 pb-3">
      {/* Hero: monthly total */}
      <div className="flex items-baseline gap-1.5">
        <span className={`text-[28px] font-semibold font-mono tracking-tight text-text-primary leading-none ${ratesLoading ? 'animate-pulse' : ''}`}>
          {formatAmount(monthlyTotal, currency)}
        </span>
        <span className="text-[12px] font-medium text-text-secondary">/{t('overview.monthly')}</span>
      </div>

      {/* Secondary stats */}
      <div className="flex items-center gap-3 mt-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-accent" />
          <span className="text-[11px] font-mono text-text-secondary">
            {formatAmount(yearlyTotal, currency)}
          </span>
          <span className="text-[11px] text-text-tertiary">{t('overview.yearly')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-text-secondary" />
          <span className="text-[11px] font-mono text-text-secondary">{activeCount}</span>
          <span className="text-[11px] text-text-tertiary">{t('overview.active')}</span>
        </div>
      </div>
    </div>
  )
}
