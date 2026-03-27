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
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2.5">
        <h2 className="text-xs font-semibold text-text-primary">{t('settings.title')}</h2>
        <button
          onClick={onBack}
          className="text-[10px] text-text-tertiary hover:text-text-secondary transition-colors cursor-default"
        >
          {t('settings.back')}
        </button>
      </div>

      <div className="px-3.5 space-y-3">
        {/* Display currency */}
        <div>
          <label className="text-[10px] text-text-tertiary mb-1 block font-medium tracking-wider uppercase">{t('settings.displayCurrency')}</label>
          <select
            value={settings.display_currency}
            onChange={(e) => onUpdate('display_currency', e.target.value)}
            className="w-full bg-bg-secondary text-text-primary text-xs px-2.5 py-1.5 rounded-[6px] border border-border focus:border-border-focus outline-none transition-colors"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="text-[10px] text-text-tertiary mb-1 block font-medium tracking-wider uppercase">{t('settings.language')}</label>
          <div className="flex bg-bg-secondary rounded-[6px] border border-border p-px overflow-hidden">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                onClick={() => onUpdate('language', lang.value)}
                className={`flex-1 text-xs py-1.5 rounded-[5px] transition-all duration-150 cursor-default ${
                  settings.language === lang.value
                    ? 'bg-bg-tertiary text-text-primary shadow-sm'
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
