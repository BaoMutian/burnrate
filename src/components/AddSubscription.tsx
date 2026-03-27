import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Subscription, BillingCycle, ServicePreset, PriceTier } from '../types'
import { formatAmount } from '../lib/format'
import FuzzySearch from './FuzzySearch'
import ServiceIcon from './ServiceIcon'

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

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'CAD', 'AUD', 'KRW', 'HKD', 'TWD']
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

const inputBase = 'w-full bg-bg-secondary text-text-primary text-sm px-3 py-2.5 rounded-[--radius-button] border outline-none transition-colors'
const inputNormal = `${inputBase} border-border focus:border-border-focus`
const inputError = `${inputBase} border-red-500/50`

export default function AddSubscription({ editing, onSave, onDelete, onCancel, saveError }: Props) {
  const { t } = useTranslation()
  const [step, setStep] = useState<'search' | 'tier' | 'form'>(editing ? 'form' : 'search')

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
  const [pendingPreset, setPendingPreset] = useState<ServicePreset | null>(null)

  function handlePresetSelect(preset: ServicePreset | null) {
    if (!preset) {
      setStep('form')
      return
    }

    setName(preset.name)
    setIconKey(preset.iconKey)

    // If preset has tiers, show tier selection step
    if (preset.tiers && preset.tiers.length > 0) {
      setPendingPreset(preset)
      setStep('tier')
    } else {
      setAmount(preset.defaultAmount.toString())
      setCurrency(preset.defaultCurrency)
      setCycle(preset.defaultCycle)
      setTier(null)
      setStep('form')
    }
  }

  function handleTierSelect(selectedTier: PriceTier) {
    setTier(selectedTier.name)
    setAmount(selectedTier.amount.toString())
    setCurrency(selectedTier.currency)
    setCycle(selectedTier.cycle)
    setPendingPreset(null)
    setStep('form')
  }

  function handleCustom(customName: string) {
    setName(customName)
    setIconKey(null)
    setTier(null)
    setStep('form')
  }

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
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <h2 className="text-sm font-semibold text-text-primary tracking-wide">{t('form.add')}</h2>
          <button
            onClick={onCancel}
            className="text-[11px] text-text-tertiary hover:text-text-secondary transition-colors cursor-default"
          >
            {t('form.cancel')}
          </button>
        </div>
        <FuzzySearch onSelect={handlePresetSelect} onCustom={handleCustom} />
      </div>
    )
  }

  // Step: tier selection
  if (step === 'tier' && pendingPreset?.tiers) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => { setPendingPreset(null); setStep('search') }}
              className="text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-default"
            >
              ←
            </button>
            <ServiceIcon iconKey={pendingPreset.iconKey} name={pendingPreset.name} />
            <h2 className="text-sm font-semibold text-text-primary">{pendingPreset.name}</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-[11px] text-text-tertiary hover:text-text-secondary transition-colors cursor-default"
          >
            {t('form.cancel')}
          </button>
        </div>

        <div className="px-5 pb-2">
          <label className="text-[11px] text-text-tertiary block font-medium tracking-wider uppercase">{t('form.selectTier')}</label>
        </div>

        <div className="flex-1 overflow-y-auto">
          {pendingPreset.tiers.map((tier) => (
            <button
              key={tier.name}
              onClick={() => handleTierSelect(tier)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-bg-secondary/60 transition-colors text-left cursor-default"
            >
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-text-primary font-medium">{tier.name}</span>
              </div>
              <span className="text-[13px] font-mono text-text-secondary">
                {formatAmount(tier.amount, tier.currency)}
                <span className="text-[10px] text-text-tertiary ml-0.5">
                  /{tier.cycle === 'monthly' ? 'mo' : tier.cycle === 'yearly' ? 'yr' : 'wk'}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Step: form
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="text-sm font-semibold text-text-primary tracking-wide">
          {editing ? t('form.edit') : t('form.add')}
        </h2>
        <button
          onClick={onCancel}
          className="text-[11px] text-text-tertiary hover:text-text-secondary transition-colors cursor-default"
        >
          {t('form.cancel')}
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 space-y-4">
        {/* Service name with icon and tier */}
        <div className="flex items-center gap-3">
          <ServiceIcon iconKey={iconKey} name={name || '?'} />
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setValidationErrors((prev) => { const n = new Set(prev); n.delete('name'); return n }) }}
            placeholder={t('form.name')}
            className={validationErrors.has('name') ? `flex-1 ${inputError}` : `flex-1 ${inputNormal}`}
          />
          {tier && (
            <span className="text-[9px] px-1.5 py-[3px] rounded-full bg-accent-dim text-accent font-medium shrink-0 tracking-wide uppercase">
              {tier}
            </span>
          )}
        </div>

        {/* Tier selector (in edit mode for tiered presets) */}
        {tier && (
          <div>
            <label className="text-[11px] text-text-tertiary mb-1.5 block font-medium tracking-wider uppercase">{t('form.tier')}</label>
            <input
              type="text"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className={inputNormal}
            />
          </div>
        )}

        {/* Amount — large input */}
        <div>
          <label className="text-[11px] text-text-tertiary mb-1.5 block font-medium tracking-wider uppercase">{t('form.amount')}</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setValidationErrors((prev) => { const n = new Set(prev); n.delete('amount'); return n }) }}
            placeholder="0.00"
            step="0.01"
            min="0"
            className={`${validationErrors.has('amount') ? inputError : inputNormal} !text-2xl font-mono`}
          />
        </div>

        {/* Currency */}
        <div>
          <label className="text-[11px] text-text-tertiary mb-1.5 block font-medium tracking-wider uppercase">{t('form.currency')}</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={inputNormal}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Billing cycle — segmented control */}
        <div>
          <label className="text-[11px] text-text-tertiary mb-1.5 block font-medium tracking-wider uppercase">{t('form.cycle')}</label>
          <div className="flex bg-bg-secondary rounded-[--radius-button] border border-border p-0.5 overflow-hidden">
            {CYCLES.map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className={`flex-1 text-sm py-2 rounded-[6px] transition-all duration-150 cursor-default ${
                  cycle === c
                    ? 'bg-bg-tertiary text-text-primary shadow-sm'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {t(`cycle.${c}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Next billing date */}
        <div>
          <label className="text-[11px] text-text-tertiary mb-1.5 block font-medium tracking-wider uppercase">{t('form.nextBilling')}</label>
          <input
            type="date"
            value={nextBilling}
            onChange={(e) => setNextBilling(e.target.value)}
            className={inputNormal}
          />
        </div>

        {/* Payment channel — dropdown */}
        <div>
          <label className="text-[11px] text-text-tertiary mb-1.5 block font-medium tracking-wider uppercase">{t('form.paymentChannel')}</label>
          <div className="flex gap-2">
            <select
              value={paymentMethod}
              onChange={(e) => { setPaymentMethod(e.target.value); if (!PAYMENT_METHODS.find(m => m.value === e.target.value && 'hasCard' in m && m.hasCard)) setCardLast4('') }}
              className={`flex-1 ${inputNormal}`}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {'i18nKey' in m && m.i18nKey ? t(m.i18nKey) : m.value}
                </option>
              ))}
            </select>
            {PAYMENT_METHODS.find(m => m.value === paymentMethod && 'hasCard' in m && m.hasCard) && (
              <input
                type="text"
                value={cardLast4}
                onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder={t('form.cardLast4')}
                maxLength={4}
                className={`w-20 ${inputNormal} font-mono text-center`}
              />
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3.5 space-y-2">
        {saveError && (
          <div className="text-[11px] text-red-400 text-center">{t('form.saveError')}</div>
        )}
        <div className="flex gap-2">
          {editing && onDelete && (
            showDeleteConfirm ? (
              <button
                onClick={onDelete}
                className="flex-1 text-sm py-2.5 rounded-[--radius-button] bg-red-950/40 text-red-400 hover:bg-red-950/60 border border-red-500/10 transition-colors cursor-default"
              >
                {t('form.deleteConfirm')}
              </button>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm py-2.5 px-3 rounded-[--radius-button] text-text-tertiary hover:text-red-400 transition-colors cursor-default"
              >
                {t('form.delete')}
              </button>
            )
          )}
          <button
            onClick={handleSave}
            className="flex-1 text-sm py-2.5 rounded-[--radius-button] bg-accent/90 text-bg-primary hover:bg-accent transition-colors cursor-default font-semibold tracking-wide"
          >
            {t('form.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
