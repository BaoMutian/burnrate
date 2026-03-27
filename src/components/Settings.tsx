import { useTranslation } from 'react-i18next'
import type { Settings as SettingsType } from '../types'

interface Props {
  settings: SettingsType
  onUpdate: <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => void
  onBack: () => void
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'CAD', 'AUD', 'KRW', 'HKD', 'TWD']
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
] as const

export default function Settings({ settings, onUpdate, onBack }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h2 className="text-sm font-medium text-text-primary">{t('settings.title')}</h2>
        <button
          onClick={onBack}
          className="text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-default"
        >
          {t('settings.back')}
        </button>
      </div>

      <div className="px-4 space-y-4">
        {/* Display currency */}
        <div>
          <label className="text-xs text-text-tertiary mb-1 block">{t('settings.displayCurrency')}</label>
          <select
            value={settings.display_currency}
            onChange={(e) => onUpdate('display_currency', e.target.value)}
            className="w-full bg-bg-secondary text-text-primary text-sm px-3 py-2 rounded-lg border border-border focus:border-border-focus outline-none"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="text-xs text-text-tertiary mb-1 block">{t('settings.language')}</label>
          <div className="flex bg-bg-secondary rounded-lg border border-border overflow-hidden">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                onClick={() => onUpdate('language', lang.value)}
                className={`flex-1 text-sm py-2 transition-colors cursor-default ${
                  settings.language === lang.value
                    ? 'bg-bg-tertiary text-text-primary'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
