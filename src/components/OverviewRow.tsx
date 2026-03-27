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
    <div className="px-3.5 pt-3 pb-2.5">
      {/* Hero: monthly total */}
      <div className="flex items-baseline gap-1.5">
        <span className={`text-[26px] font-semibold font-mono tracking-tight text-text-primary hero-glow leading-none ${ratesLoading ? 'animate-pulse' : ''}`}>
          {formatAmount(monthlyTotal, currency)}
        </span>
        <span className="text-[11px] font-medium text-text-tertiary">/{t('overview.monthly')}</span>
      </div>

      {/* Secondary stats */}
      <div className="flex items-center gap-3 mt-1.5">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-accent opacity-60" />
          <span className="text-[10px] font-mono text-text-secondary">
            {formatAmount(yearlyTotal, currency)}
          </span>
          <span className="text-[10px] text-text-tertiary">{t('overview.yearly')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-text-tertiary" />
          <span className="text-[10px] font-mono text-text-secondary">{activeCount}</span>
          <span className="text-[10px] text-text-tertiary">{t('overview.active')}</span>
        </div>
      </div>
    </div>
  )
}
