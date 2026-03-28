import { useState, useMemo, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { Subscription, BillingCycle, ServicePreset } from '../types'
import { formatAmount } from '../lib/format'
import { getFavoritePresets, toggleFavoritePreset } from '../lib/db'
import { SERVICE_PRESETS } from '../lib/presets'
import FuzzySearch from './FuzzySearch'
import ServiceIcon from './ServiceIcon'
import SegmentedControl from './SegmentedControl'
import FormRow from './FormRow'

interface Props {
  editing?: Subscription | null
  onSave: (data: {
    name: string
    icon_key: string | null
    amount: number
    currency: string
    cycle: BillingCycle
    tier: string | null
    next_billing: string
    payment_channel: string | null
    account: string | null
    password: string | null
    notes: string | null
  }) => void
  onDelete?: () => void
  onCancel: () => void
  saveError?: boolean
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
const CYCLES: BillingCycle[] = ['monthly', 'yearly', 'weekly']

const PAYMENT_METHODS = [
  { value: '', i18nKey: 'form.paymentNone', hasCard: false },
  { value: 'Alipay', i18nKey: 'payment.alipay', hasCard: false },
  { value: 'WeChat Pay', i18nKey: 'payment.wechat', hasCard: false },
  { value: 'Visa', hasCard: true },
  { value: 'Mastercard', hasCard: true },
  { value: 'PayPal', hasCard: false },
  { value: 'Apple Pay', hasCard: false },
  { value: 'Google Pay', hasCard: false },
  { value: 'Amex', hasCard: true },
  { value: 'UnionPay', i18nKey: 'payment.unionpay', hasCard: true },
] as const

function todayStr() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const sectionClass = 'text-[11px] text-text-quaternary mb-1.5 block font-medium tracking-wider uppercase'

export default function AddSubscription({ editing, onSave, onDelete, onCancel, saveError }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'
  const [step, setStep] = useState<'search' | 'form'>(editing ? 'form' : 'search')

  const [name, setName] = useState(editing?.name || '')
  const [iconKey, setIconKey] = useState<string | null>(editing?.icon_key || null)
  const [amount, setAmount] = useState(editing?.amount?.toString() || '')
  const [currency, setCurrency] = useState(editing?.currency || 'USD')
  const [cycle, setCycle] = useState<BillingCycle>(editing?.cycle || 'monthly')
  const [tier, setTier] = useState<string | null>(editing?.tier || null)
  const [nextBilling, setNextBilling] = useState(editing?.next_billing || todayStr())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [account, setAccount] = useState(editing?.account || '')
  const [password, setPassword] = useState(editing?.password || '')
  const [notes, setNotes] = useState(editing?.notes || '')
  const [showPassword, setShowPassword] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    getFavoritePresets().then(names => setFavorites(new Set(names))).catch(() => {})
  }, [])

  const handleToggleFavorite = useCallback(async (name: string) => {
    await toggleFavoritePreset(name)
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }, [])

  // Parse existing payment_channel into method + last4
  const parsePaymentChannel = (raw: string | null) => {
    if (!raw) return { method: '', last4: '' }
    const match = raw.match(/^(.+?)\s*····(\d{4})$/)
    if (match) return { method: match[1], last4: match[2] }
    return { method: raw, last4: '' }
  }
  const parsed = parsePaymentChannel(editing?.payment_channel ?? null)
  const [paymentMethod, setPaymentMethod] = useState(parsed.method)
  const [cardLast4, setCardLast4] = useState(parsed.last4)

  const showCardInput = PAYMENT_METHODS.find(m => m.value === paymentMethod && 'hasCard' in m && m.hasCard) !== undefined

  // Look up available tiers for the current service (by name or iconKey)
  const availableTiers = useMemo(() => {
    const preset = SERVICE_PRESETS.find(
      (p) => p.name === name || (iconKey && p.iconKey === iconKey)
    )
    return preset?.tiers ?? null
  }, [name, iconKey])

  function handlePresetSelect(preset: ServicePreset | null) {
    if (!preset) {
      setStep('form')
      return
    }

    setName(preset.name)
    setIconKey(preset.iconKey)

    if (preset.tiers && preset.tiers.length > 0) {
      const defaultTier = preset.tiers[0]
      setTier(defaultTier.name)
      setAmount(defaultTier.amount.toString())
      setCurrency(defaultTier.currency)
      setCycle(defaultTier.cycle)
    } else {
      setAmount(preset.defaultAmount.toString())
      setCurrency(preset.defaultCurrency)
      setCycle(preset.defaultCycle)
      setTier(null)
    }

    setStep('form')
  }

  function handleTierChange(tierName: string) {
    if (!availableTiers) return
    const selected = availableTiers.find((t) => t.name === tierName)
    if (selected) {
      setTier(selected.name)
      setAmount(selected.amount.toString())
      setCurrency(selected.currency)
      setCycle(selected.cycle)
    }
  }

  function handleCustom(customName: string) {
    setName(customName)
    setIconKey(null)
    setTier(null)
    setStep('form')
  }

  const selectedTierDetails = useMemo(() => {
    if (!tier || !availableTiers) return null
    return availableTiers.find((item) => item.name === tier) ?? null
  }, [tier, availableTiers])

  function handleSave() {
    const parsedAmount = parseFloat(amount)
    const errors = new Set<string>()
    if (!name.trim()) errors.add('name')
    if (isNaN(parsedAmount) || parsedAmount <= 0) errors.add('amount')
    if (errors.size > 0) {
      setValidationErrors(errors)
      return
    }
    setValidationErrors(new Set())

    // Format payment channel: "Visa ····4242" or "Alipay" or null
    let channel: string | null = null
    if (paymentMethod) {
      channel = paymentMethod
      if (cardLast4.length === 4) {
        channel += ` ····${cardLast4}`
      }
    }

    onSave({
      name: name.trim(),
      icon_key: iconKey,
      amount: parsedAmount,
      currency,
      cycle,
      tier: tier || null,
      next_billing: nextBilling,
      payment_channel: channel,
      account: account.trim() || null,
      password: password || null,
      notes: notes.trim() || null,
    })
  }

  const currencyInfo = CURRENCIES.find((c) => c.code === currency)
  const paymentInfo = PAYMENT_METHODS.find(m => m.value === paymentMethod)

  // Step: search
  if (step === 'search') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
          <h2 className="text-[14px] font-semibold text-text-primary">{t('form.add')}</h2>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-[10px] flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/[0.06] transition-colors cursor-default"
            aria-label={t('form.cancel')}
          >
            <svg viewBox="0 0 24 24" className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
        <FuzzySearch onSelect={handlePresetSelect} onCustom={handleCustom} favorites={favorites} onToggleFavorite={handleToggleFavorite} />
      </div>
    )
  }

  // Step: form
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
        <h2 className="text-[14px] font-semibold text-text-primary">
          {editing ? t('form.edit') : t('form.add')}
        </h2>
        <button
          onClick={onCancel}
          className="w-7 h-7 rounded-[10px] flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/[0.06] transition-colors cursor-default"
          aria-label={t('form.cancel')}
        >
          <svg viewBox="0 0 24 24" className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-3 space-y-2.5">
        {/* Hero: icon + name + tier badge */}
        <div className="flex items-center gap-2.5">
          <ServiceIcon iconKey={iconKey} name={name || '?'} />
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setValidationErrors((prev) => { const n = new Set(prev); n.delete('name'); return n }) }}
            placeholder={t('form.name')}
            className={`flex-1 mac-field text-text-primary text-[13px] px-3 py-[7px] outline-none ${validationErrors.has('name') ? '!border-red-500/50' : ''}`}
          />
          {tier && (
            <span className="text-[11px] px-1.5 py-[2px] rounded-full bg-accent-dim text-accent font-medium shrink-0 tracking-wide uppercase">
              {tier}
            </span>
          )}
        </div>

        {/* Tier selector */}
        {tier && availableTiers && availableTiers.length > 0 && (
          <div>
            <SegmentedControl
              options={availableTiers.map((item) => ({ value: item.name, label: item.name }))}
              value={tier}
              onChange={handleTierChange}
            />
            {selectedTierDetails && (
              <div className="flex items-center justify-between px-1 pt-1.5">
                <span className="text-[11px] text-text-tertiary">{t('form.selectTier')}</span>
                <span className="text-[11px] font-numeric text-text-secondary">
                  {formatAmount(selectedTierDetails.amount, selectedTierDetails.currency)}
                  <span className="text-text-tertiary ml-0.5">
                    /{selectedTierDetails.cycle === 'monthly' ? 'mo' : selectedTierDetails.cycle === 'yearly' ? 'yr' : 'wk'}
                  </span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Pricing card */}
        <div>
          <label className={sectionClass}>{t('form.pricingSection')}</label>
          <div className="mac-field overflow-hidden">
            <FormRow label={t('form.amount')} error={validationErrors.has('amount')}>
              <input
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setValidationErrors((prev) => { const n = new Set(prev); n.delete('amount'); return n }) }}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="bg-transparent text-[15px] font-numeric text-text-primary text-right outline-none min-w-0 w-full placeholder:text-text-tertiary"
              />
            </FormRow>
            <FormRow label={t('form.currency')}>
              <div className="relative flex items-center">
                <span className="text-text-secondary text-[13px] pointer-events-none">
                  {currencyInfo?.flag}{' '}
                  {currencyInfo?.[lang] ?? currency}
                </span>
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-text-quaternary ml-1 shrink-0 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 4.5 6 7.5 9 4.5" />
                </svg>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-default text-[13px]"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c[lang]}</option>
                  ))}
                </select>
              </div>
            </FormRow>
            <FormRow label={t('form.cycle')} last>
              <SegmentedControl
                options={CYCLES.map((c) => ({ value: c, label: t(`cycle.${c}`) }))}
                value={cycle}
                onChange={setCycle}
              />
            </FormRow>
          </div>
        </div>

        {/* Billing card */}
        <div>
          <label className={sectionClass}>{t('form.billingSection')}</label>
          <div className="mac-field overflow-hidden">
            <FormRow label={t('form.nextBilling')}>
              <input
                type="date"
                value={nextBilling}
                onChange={(e) => setNextBilling(e.target.value)}
                className="bg-transparent text-[13px] font-numeric text-text-primary text-right outline-none min-w-0 placeholder:text-text-tertiary"
              />
            </FormRow>
            <FormRow label={t('form.paymentChannel')} last={!showCardInput}>
              <div className="relative flex items-center">
                <span className="text-text-secondary text-[13px] pointer-events-none">
                  {paymentInfo && 'i18nKey' in paymentInfo && paymentInfo.i18nKey
                    ? t(paymentInfo.i18nKey)
                    : (paymentMethod || t('form.paymentNone'))}
                </span>
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-text-quaternary ml-1 shrink-0 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 4.5 6 7.5 9 4.5" />
                </svg>
                <select
                  value={paymentMethod}
                  onChange={(e) => { setPaymentMethod(e.target.value); if (!PAYMENT_METHODS.find(m => m.value === e.target.value && 'hasCard' in m && m.hasCard)) setCardLast4('') }}
                  className="absolute inset-0 opacity-0 cursor-default text-[13px]"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {'i18nKey' in m && m.i18nKey ? t(m.i18nKey) : (m.value || t('form.paymentNone'))}
                    </option>
                  ))}
                </select>
              </div>
            </FormRow>
            {showCardInput && (
              <FormRow label={t('form.cardLast4')} last>
                <input
                  type="text"
                  value={cardLast4}
                  onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="0000"
                  maxLength={4}
                  className="bg-transparent text-[13px] font-numeric text-text-primary text-right outline-none w-16 placeholder:text-text-tertiary tracking-widest"
                />
              </FormRow>
            )}
          </div>
        </div>

        {/* Account card */}
        <div>
          <label className={sectionClass}>{t('form.accountSection')}</label>
          <div className="mac-field overflow-hidden">
            <div className="flex items-center px-3 py-[7px]">
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder={t('form.account')}
                className="flex-1 bg-transparent text-[13px] text-text-primary outline-none min-w-0 placeholder:text-text-tertiary"
              />
            </div>
            <div className="border-t border-white/[0.05] mx-3" />
            <div className="flex items-center px-3 py-[7px]">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('form.password')}
                className="flex-1 bg-transparent text-[13px] text-text-primary outline-none min-w-0 placeholder:text-text-tertiary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="shrink-0 w-6 h-6 flex items-center justify-center text-text-quaternary hover:text-text-secondary transition-colors cursor-default"
              >
                {showPassword ? (
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 2l12 12" />
                    <path d="M6.5 6.5a2 2 0 0 0 3 3" />
                    <path d="M3.5 3.5C2 5 1 8 1 8s2.5 5 7 5c1.5 0 2.8-.5 3.8-1.2" />
                    <path d="M11 11c1.5-1.3 4-3 4-3s-2.5-5-7-5c-.7 0-1.4.1-2 .3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
                    <circle cx="8" cy="8" r="2" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={sectionClass}>{t('form.notes')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('form.notesPlaceholder')}
            rows={3}
            className="mac-field w-full text-text-primary text-[13px] px-3 py-2 outline-none resize-none placeholder:text-text-tertiary"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="px-3 py-2.5 space-y-2">
        {saveError && (
          <div className="text-[12px] text-red-400 text-center">{t('form.saveError')}</div>
        )}
        {showDeleteConfirm ? (
          <div className="flex gap-2">
            <button
              onClick={onDelete}
              className="mac-button mac-button-danger flex-1 text-[13px] py-[7px] cursor-default"
            >
              {t('form.deleteConfirm')}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="mac-button mac-button-secondary flex-1 text-[13px] py-[7px] text-text-secondary cursor-default"
            >
              {t('form.cancel')}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            {editing && onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="mac-button mac-button-quiet text-[13px] py-[7px] px-3 text-text-tertiary hover:text-red-400 cursor-default"
              >
                {t('form.delete')}
              </button>
            )}
            <button
              onClick={handleSave}
              className="mac-button mac-button-primary flex-1 text-[13px] py-[7px] cursor-default font-semibold"
            >
              {t('form.save')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
