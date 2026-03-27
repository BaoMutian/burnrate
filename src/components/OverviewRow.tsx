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
    <div className="px-3 pt-3 pb-2">
      {/* Hero: monthly total */}
      <div className="flex items-baseline gap-1">
        <span className={`text-[24px] font-semibold font-numeric tracking-tight text-text-primary leading-none ${ratesLoading ? 'animate-pulse' : ''}`}>
          {formatAmount(monthlyTotal, currency)}
        </span>
        <span className="text-[10px] font-medium text-text-secondary">/{t('overview.monthly')}</span>
      </div>

      {/* Secondary stats */}
      <div className="inline-flex items-center gap-2.5 mt-2 px-2 py-1 rounded-[12px] bg-white/[0.03] border border-border-highlight">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-accent" />
          <span className="text-[10px] font-numeric text-text-secondary">
            {formatAmount(yearlyTotal, currency)}
          </span>
          <span className="text-[10px] text-text-tertiary">{t('overview.yearly')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-text-secondary" />
          <span className="text-[10px] font-numeric text-text-secondary">{activeCount}</span>
          <span className="text-[10px] text-text-tertiary">{t('overview.active')}</span>
        </div>
      </div>
    </div>
  )
}
