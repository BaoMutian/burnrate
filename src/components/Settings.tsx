import { useTranslation } from 'react-i18next'
import type { Settings as SettingsType } from '../types'
import SegmentedControl from './SegmentedControl'

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
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div>
          <h2 className="text-[14px] font-semibold text-text-primary">{t('settings.title')}</h2>
          <p className="text-[11px] text-text-tertiary mt-0.5">{t('settings.subtitle')}</p>
        </div>
        <button
          onClick={onBack}
          className="mac-button mac-button-quiet px-2 text-[12px] text-text-secondary cursor-default tracking-wide -mr-1"
        >
          {t('settings.back')}
        </button>
      </div>

      <div className="px-3 pb-3 space-y-3">
        <div className="mac-field px-3 py-3 space-y-3">
          <div>
            <label className="text-[11px] text-text-secondary mb-1.5 block font-medium tracking-wide">{t('settings.displayCurrency')}</label>
            <select
              value={settings.display_currency}
              onChange={(e) => onUpdate('display_currency', e.target.value)}
              className="mac-field w-full text-text-primary text-[13px] px-3 py-[7px] outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-text-secondary mb-1.5 block font-medium tracking-wide">{t('settings.language')}</label>
            <SegmentedControl
              options={LANGUAGES.map((l) => ({ value: l.value, label: l.label }))}
              value={settings.language}
              onChange={(v) => onUpdate('language', v)}
            />
          </div>

          <div>
            <label className="text-[11px] text-text-secondary mb-1.5 block font-medium tracking-wide">{t('settings.sortBy')}</label>
            <SegmentedControl
              options={[
                { value: 'next_billing', label: t('list.sortByDate') },
                { value: 'amount', label: t('list.sortByAmount') },
              ]}
              value={settings.sort_by}
              onChange={(v) => onUpdate('sort_by', v)}
            />
          </div>
        </div>

        <div className="px-1">
          <p className="text-[11px] text-text-quaternary">{t('settings.shortcutHint')}</p>
        </div>
      </div>
    </div>
  )
}
