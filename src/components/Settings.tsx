import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Settings as SettingsType } from '../types'
import SegmentedControl from './SegmentedControl'
import FormRow from './FormRow'

interface Props {
  settings: SettingsType
  onUpdate: <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => void
  onBack: () => void
  onClearData: () => void
}

const CURRENCIES = [
  { code: 'CNY', flag: '🇨🇳', en: 'CNY', zh: '人民币' },
  { code: 'USD', flag: '🇺🇸', en: 'USD', zh: '美元' },
  { code: 'EUR', flag: '🇪🇺', en: 'EUR', zh: '欧元' },
  { code: 'GBP', flag: '🇬🇧', en: 'GBP', zh: '英镑' },
  { code: 'JPY', flag: '🇯🇵', en: 'JPY', zh: '日元' },
  { code: 'CAD', flag: '🇨🇦', en: 'CAD', zh: '加元' },
  { code: 'AUD', flag: '🇦🇺', en: 'AUD', zh: '澳元' },
  { code: 'KRW', flag: '🇰🇷', en: 'KRW', zh: '韩元' },
  { code: 'HKD', flag: '🇭🇰', en: 'HKD', zh: '港币' },
]
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
] as const

export default function Settings({ settings, onUpdate, onBack, onClearData }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  return (
    <div className="flex flex-col h-full">
      {/* Header — matches main panel header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <h2 className="text-[14px] font-bold text-text-primary tracking-tight">{t('settings.title')}</h2>
        <button
          onClick={onBack}
          className="w-7 h-7 rounded-[10px] flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/[0.06] transition-colors cursor-default"
          aria-label={t('settings.back')}
        >
          <svg viewBox="0 0 24 24" className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2.5">
        {/* Settings group */}
        <div className="mac-field overflow-hidden">
          <FormRow label={t('settings.displayCurrency')}>
            <div className="relative flex items-center">
              <span className="text-text-secondary text-[13px] pointer-events-none">
                {CURRENCIES.find((c) => c.code === settings.display_currency)?.flag}{' '}
                {CURRENCIES.find((c) => c.code === settings.display_currency)?.[lang] ?? settings.display_currency}
              </span>
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-text-quaternary ml-1 shrink-0 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 4.5 6 7.5 9 4.5" />
              </svg>
              <select
                value={settings.display_currency}
                onChange={(e) => onUpdate('display_currency', e.target.value)}
                className="absolute inset-0 opacity-0 cursor-default text-[13px]"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c[lang]}</option>
                ))}
              </select>
            </div>
          </FormRow>

          <FormRow label={t('settings.language')}>
            <SegmentedControl
              options={LANGUAGES.map((l) => ({ value: l.value, label: l.label }))}
              value={settings.language}
              onChange={(v) => onUpdate('language', v)}
            />
          </FormRow>

          <FormRow label={t('settings.trayDisplay')} last>
            <SegmentedControl
              options={[
                { value: 'monthly' as const, label: t('settings.trayMonthly') },
                { value: 'daily' as const, label: t('settings.trayDaily') },
              ]}
              value={settings.tray_display}
              onChange={(v) => onUpdate('tray_display', v)}
            />
          </FormRow>
        </div>

        <label className="text-[11px] text-text-quaternary mb-1.5 block font-medium tracking-wider uppercase">{t('settings.shortcuts')}</label>
        <div className="mac-field overflow-hidden">
          <FormRow label={t('settings.shortcutNew')}>
            <kbd className="text-[11px] text-text-tertiary font-mono">⌘ N</kbd>
          </FormRow>
          <FormRow label={t('settings.shortcutSettings')}>
            <kbd className="text-[11px] text-text-tertiary font-mono">⌘ ,</kbd>
          </FormRow>
          <FormRow label={t('settings.shortcutBack')} last>
            <kbd className="text-[11px] text-text-tertiary font-mono">Esc</kbd>
          </FormRow>
        </div>

        <div className="mac-field overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="text-[13px] text-text-primary">{t('settings.clearData')}</span>
            {showClearConfirm ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { onClearData(); setShowClearConfirm(false) }}
                  className="text-[12px] px-2 py-0.5 rounded-[5px] cursor-default bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30 transition-colors"
                >
                  {t('settings.clearDataConfirm')}
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="text-[12px] px-2 py-0.5 rounded-[5px] cursor-default text-text-tertiary hover:text-text-primary hover:bg-white/[0.06] transition-colors"
                >
                  {t('form.cancel')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-text-tertiary hover:text-red-400 transition-colors cursor-default"
              >
                <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 4h11" />
                  <path d="M5.5 4V2.75a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4" />
                  <path d="M3.75 4v8.5a1.25 1.25 0 0 0 1.25 1.25h6a1.25 1.25 0 0 0 1.25-1.25V4" />
                  <path d="M6.5 6.75v3.5" />
                  <path d="M9.5 6.75v3.5" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <p className="text-[11px] text-text-quaternary px-1 leading-relaxed">{t('settings.clearDataHint')}</p>
      </div>
    </div>
  )
}
