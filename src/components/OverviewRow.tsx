import { useTranslation } from 'react-i18next'
import { formatAmount } from '../lib/format'

interface Props {
  monthlyTotal: number
  yearlyTotal: number
  activeCount: number
  currency: string
}

export default function OverviewRow({ monthlyTotal, yearlyTotal, activeCount, currency }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex items-baseline justify-between px-4 pt-4 pb-3">
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-semibold font-mono text-text-primary">
          {formatAmount(monthlyTotal, currency)}
        </span>
        <span className="text-xs text-text-secondary">/{t('overview.monthly')}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-mono text-text-secondary">
          {formatAmount(yearlyTotal, currency)}
        </span>
        <span className="text-xs text-text-tertiary"> {t('overview.yearly')}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-mono text-text-secondary">{activeCount}</span>
        <span className="text-xs text-text-tertiary">{t('overview.active')}</span>
      </div>
    </div>
  )
}
