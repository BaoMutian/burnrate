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
      <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
        <h2 className="text-[13px] font-semibold text-text-primary">{t('settings.title')}</h2>
        <button
          onClick={onBack}
          className="mac-button mac-button-quiet px-1.5 text-[10px] text-text-secondary cursor-default tracking-wide -mr-1"
        >
          {t('settings.back')}
        </button>
      </div>

      <div className="px-3 space-y-3">
        {/* Display currency */}
        <div>
          <label className="text-[10px] text-text-secondary mb-1.5 block font-medium tracking-wide">{t('settings.displayCurrency')}</label>
          <select
            value={settings.display_currency}
            onChange={(e) => onUpdate('display_currency', e.target.value)}
            className="mac-field w-full text-text-primary text-[12px] px-3 py-[7px] outline-none"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="text-[10px] text-text-secondary mb-1.5 block font-medium tracking-wide">{t('settings.language')}</label>
          <div className="mac-segmented flex p-[2px] overflow-hidden">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                onClick={() => onUpdate('language', lang.value)}
                className={`mac-segmented-button flex-1 text-[12px] py-[6px] cursor-default ${
                  settings.language === lang.value
                    ? 'is-active'
                    : 'is-idle'
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
