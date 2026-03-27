import { useTranslation } from 'react-i18next'
import { formatAmount } from '../lib/format'

interface Props {
  monthlyTotal: number
  cumulativeTotal: number
  dailyAverage: number
  activeCount: number
  currency: string
  ratesLoading?: boolean
}

export default function OverviewRow({ monthlyTotal, cumulativeTotal, dailyAverage, activeCount, currency, ratesLoading }: Props) {
  const { t } = useTranslation()

  return (
    <div className="px-3 pt-0.5 pb-1.5">
      {/* Hero: monthly total */}
      <div className="flex items-baseline gap-0.5">
        <span className={`text-[24px] font-bold font-numeric text-text-primary leading-none tracking-tight ${ratesLoading ? 'animate-pulse' : ''}`}>
          {formatAmount(monthlyTotal, currency)}
        </span>
        <span className="text-[11px] text-text-quaternary font-medium">/{t('overview.monthly')}</span>
      </div>

      {/* Secondary: cumulative · daily · active — no decorative dots */}
      <div className="flex items-baseline flex-wrap mt-1.5 text-[11px] leading-tight">
        <span className="font-numeric text-text-secondary">{formatAmount(cumulativeTotal, currency)}</span>
        <span className="text-text-quaternary ml-0.5">{t('overview.cumulative')}</span>
        <span className="text-text-quaternary mx-1">·</span>
        <span className="font-numeric text-text-secondary">{formatAmount(dailyAverage, currency)}</span>
        <span className="text-text-quaternary">{t('overview.daily')}</span>
        <span className="text-text-quaternary mx-1">·</span>
        <span className="font-numeric text-text-secondary tabular-nums">{activeCount}</span>
        <span className="text-text-quaternary ml-0.5">{t('overview.active')}</span>
      </div>
    </div>
  )
}
