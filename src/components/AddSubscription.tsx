import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Subscription, BillingCycle, ServicePreset } from '../types'
import { formatAmount } from '../lib/format'
import { SERVICE_PRESETS } from '../lib/presets'
import FuzzySearch from './FuzzySearch'
import ServiceIcon from './ServiceIcon'
import SegmentedControl from './SegmentedControl'
import SelectField from './SelectField'

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
  return new Date().toISOString().split('T')[0]
}

const inputStyle = 'mac-field text-text-primary text-[13px] px-3 py-[7px] outline-none'
const inputNormal = `w-full ${inputStyle}`
const inputError = `w-full ${inputStyle} !border-red-500/50`
const inputInline = inputStyle
const labelClass = 'text-[11px] text-text-secondary mb-1.5 block font-medium tracking-wide'

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
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set())

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
    })
  }

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
        <FuzzySearch onSelect={handlePresetSelect} onCustom={handleCustom} />
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
      <div className="flex-1 overflow-y-auto px-3 space-y-3">
        {/* Service name with icon and tier badge */}
        <div className="flex items-center gap-2.5">
          <ServiceIcon iconKey={iconKey} name={name || '?'} />
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setValidationErrors((prev) => { const n = new Set(prev); n.delete('name'); return n }) }}
            placeholder={t('form.name')}
            className={validationErrors.has('name') ? `flex-1 ${inputError}` : `flex-1 ${inputNormal}`}
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
            <label className={labelClass}>{t('form.tier')}</label>
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

        {/* Amount */}
        <div>
          <label className={labelClass}>{t('form.amount')}</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setValidationErrors((prev) => { const n = new Set(prev); n.delete('amount'); return n }) }}
            placeholder="0.00"
            step="0.01"
            min="0"
            className={`${validationErrors.has('amount') ? inputError : inputNormal} !text-[15px] font-numeric`}
          />
        </div>

        {/* Currency + Cycle row */}
        <div className="flex gap-2">
          <div className="w-24 shrink-0">
            <label className={labelClass}>{t('form.currency')}</label>
            <SelectField
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c[lang]}</option>
              ))}
            </SelectField>
          </div>
          <div className="flex-1">
            <label className={labelClass}>{t('form.cycle')}</label>
            <SegmentedControl
              options={CYCLES.map((c) => ({ value: c, label: t(`cycle.${c}`) }))}
              value={cycle}
              onChange={setCycle}
            />
          </div>
        </div>

        {/* Next billing date */}
        <div>
          <label className={labelClass}>{t('form.nextBilling')}</label>
          <input
            type="date"
            value={nextBilling}
            onChange={(e) => setNextBilling(e.target.value)}
            className={`${inputNormal} font-numeric`}
          />
        </div>

        {/* Payment channel */}
        <div>
          <label className={labelClass}>{t('form.paymentChannel')}</label>
          <div className="flex gap-1.5">
            <div className="flex-1 min-w-0">
              <SelectField
              value={paymentMethod}
              onChange={(e) => { setPaymentMethod(e.target.value); if (!PAYMENT_METHODS.find(m => m.value === e.target.value && 'hasCard' in m && m.hasCard)) setCardLast4('') }}
              className={inputInline}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {'i18nKey' in m && m.i18nKey ? t(m.i18nKey) : (m.value || t('form.paymentNone'))}
                  </option>
                ))}
              </SelectField>
            </div>
            {PAYMENT_METHODS.find(m => m.value === paymentMethod && 'hasCard' in m && m.hasCard) && (
              <input
                type="text"
                value={cardLast4}
                onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder={t('form.cardLast4')}
                maxLength={4}
                className={`w-16 shrink-0 ${inputInline} font-numeric text-center`}
              />
            )}
          </div>
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
