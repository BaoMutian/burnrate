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
    <div className="px-5 pt-5 pb-4">
      {/* Hero: monthly total */}
      <div className="flex items-baseline gap-2">
        <span className={`text-[32px] font-semibold font-mono tracking-tight text-text-primary hero-glow ${ratesLoading ? 'animate-pulse' : ''}`}>
          {formatAmount(monthlyTotal, currency)}
        </span>
        <span className="text-sm font-medium text-text-tertiary">/{t('overview.monthly')}</span>
      </div>

      {/* Secondary stats */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-accent opacity-60" />
          <span className="text-xs font-mono text-text-secondary">
            {formatAmount(yearlyTotal, currency)}
          </span>
          <span className="text-[11px] text-text-tertiary">{t('overview.yearly')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-text-tertiary" />
          <span className="text-xs font-mono text-text-secondary">{activeCount}</span>
          <span className="text-[11px] text-text-tertiary">{t('overview.active')}</span>
        </div>
      </div>
    </div>
  )
}
