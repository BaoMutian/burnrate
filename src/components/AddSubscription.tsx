import { useState, useMemo, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { Subscription, BillingCycle, BillingType, ServicePreset, Topup } from '../types'
import { formatAmount } from '../lib/format'
import { getFavoritePresets, toggleFavoritePreset, getTopups, addTopup, deleteTopup } from '../lib/db'
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
    billing_type: BillingType
    tier: string | null
    next_billing: string
    payment_channel: string | null
    account: string | null
    password: string | null
    notes: string | null
    auto_renew: number
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

function fullDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

const sectionClass = 'text-[11px] text-text-quaternary mb-1.5 block font-medium tracking-wider uppercase'

export default function AddSubscription({ editing, onSave, onDelete, onCancel, saveError }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'zh' ? 'zh' : 'en'
  const [step, setStep] = useState<'search' | 'form' | 'topups'>(editing ? 'form' : 'search')

  const [name, setName] = useState(editing?.name || '')
  const [iconKey, setIconKey] = useState<string | null>(editing?.icon_key || null)
  const [billingType, setBillingType] = useState<BillingType>(editing?.billing_type || 'recurring')
  const [amount, setAmount] = useState(editing?.amount?.toString() || '')
  const [currency, setCurrency] = useState(editing?.currency || 'USD')
  const [cycle, setCycle] = useState<BillingCycle>(editing?.cycle || 'monthly')
  const [tier, setTier] = useState<string | null>(editing?.tier || null)
  const [autoRenew, setAutoRenew] = useState(editing ? editing.auto_renew !== 0 : true)
  const [nextBilling, setNextBilling] = useState(editing?.next_billing || todayStr())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [account, setAccount] = useState(editing?.account || '')
  const [password, setPassword] = useState(editing?.password || '')
  const [notes, setNotes] = useState(editing?.notes || '')
  const [showPassword, setShowPassword] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set())

  // Topup state (for prepaid editing)
  const [topups, setTopups] = useState<Topup[]>([])
  const [topupAmount, setTopupAmount] = useState('')

  useEffect(() => {
    getFavoritePresets().then(names => setFavorites(new Set(names))).catch(() => {})
  }, [])

  // Load topups when editing a prepaid subscription
  useEffect(() => {
    if (editing && editing.billing_type === 'prepaid') {
      getTopups(editing.id).then(setTopups).catch(() => {})
    }
  }, [editing])

  const topupTotal = useMemo(() => topups.reduce((sum, t) => sum + t.amount, 0), [topups])

  const handleToggleFavorite = useCallback(async (name: string) => {
    await toggleFavoritePreset(name)
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }, [])

  async function handleAddTopup() {
    if (!editing) return
    const parsed = parseFloat(topupAmount)
    if (isNaN(parsed) || parsed <= 0) return
    await addTopup(editing.id, parsed, currency, null)
    const updated = await getTopups(editing.id)
    setTopups(updated)
    setTopupAmount('')
  }

  async function handleDeleteTopup(id: string) {
    if (!editing) return
    await deleteTopup(id)
    const updated = await getTopups(editing.id)
    setTopups(updated)
  }

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

    if (preset.defaultBillingType) {
      setBillingType(preset.defaultBillingType)
    }

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
    const errors = new Set<string>()
    if (!name.trim()) errors.add('name')
    if (billingType === 'recurring') {
      const parsedAmount = parseFloat(amount)
      if (isNaN(parsedAmount) || parsedAmount <= 0) errors.add('amount')
    }
    if (errors.size > 0) {
      setValidationErrors(errors)
      return
    }
    setValidationErrors(new Set())

    // Format payment channel
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
      amount: billingType === 'prepaid' ? 0 : parseFloat(amount) || 0,
      currency,
      cycle,
      billing_type: billingType,
      tier: billingType === 'prepaid' ? null : (tier || null),
      next_billing: billingType === 'prepaid' ? todayStr() : nextBilling,
      payment_channel: channel,
      account: account.trim() || null,
      password: password || null,
      notes: notes.trim() || null,
      auto_renew: billingType === 'prepaid' ? 0 : (autoRenew ? 1 : 0),
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

  // Step: topup history
  if (step === 'topups' && editing) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
          <h2 className="text-[14px] font-semibold text-text-primary">{t('form.topupSection')}</h2>
          <button
            onClick={() => setStep('form')}
            className="w-7 h-7 rounded-[10px] flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/[0.06] transition-colors cursor-default"
            aria-label={t('settings.back')}
          >
            <svg viewBox="0 0 24 24" className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-2">
          {/* Add topup: amount input + accent button */}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              value={topupAmount}
              onChange={(e) => {
                const v = e.target.value
                if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) setTopupAmount(v)
              }}
              placeholder="0.00"
              step="1"
              min="0"
              className="mac-field flex-1 text-[15px] font-numeric text-text-primary px-3 py-[7px] outline-none min-w-0 placeholder:text-text-tertiary"
            />
            <button
              onClick={handleAddTopup}
              className="mac-button mac-button-primary text-[12px] py-[7px] px-3.5 cursor-default font-semibold shrink-0"
            >
              {t('form.addTopup')}
            </button>
          </div>

          {/* Topup ledger */}
          {topups.length > 0 ? (
            <div className="mac-field overflow-hidden">
              {topups.map((tp, idx) => (
                <div key={tp.id}>
                  {idx > 0 && <div className="border-t border-white/[0.05] mx-3" />}
                  <div className="flex items-center justify-between px-3 py-2 group">
                    <div className="flex flex-col">
                      <span className="font-numeric text-[13px] text-text-primary font-medium leading-tight">
                        +{formatAmount(tp.amount, tp.currency)}
                      </span>
                      <span className="font-numeric text-[10px] text-text-quaternary leading-tight mt-0.5">
                        {fullDate(tp.created_at.split(/[T ]/)[0])}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTopup(tp.id)}
                      className="w-5 h-5 flex items-center justify-center rounded-full text-text-quaternary opacity-0 group-hover:opacity-100 hover:!text-red-400 hover:bg-red-500/[0.08] transition-all cursor-default"
                    >
                      <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                        <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-8 pb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-text-quaternary/40 mb-2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
              </svg>
              <div className="text-text-quaternary text-[12px]">{t('form.topupEmpty')}</div>
            </div>
          )}
        </div>

        {/* Total footer */}
        {topups.length > 0 && (
          <>
            <div className="mx-3 border-t border-border" />
            <div className="flex items-center justify-between px-3 py-2.5 text-[12px]">
              <span className="text-text-tertiary">{t('form.topupTotal')}</span>
              <span className="font-numeric text-text-primary font-semibold">
                {formatAmount(topupTotal, currency)}
              </span>
            </div>
          </>
        )}
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
        {/* Hero: icon + name + tier */}
        <div className="flex items-center gap-2.5">
          <ServiceIcon iconKey={iconKey} name={name || '?'} size="lg" />
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setValidationErrors((prev) => { const n = new Set(prev); n.delete('name'); return n }) }}
            placeholder={t('form.name')}
            className={`flex-1 min-w-0 mac-field text-text-primary text-[13px] px-3 py-[7px] outline-none ${validationErrors.has('name') ? '!border-red-500/50' : ''}`}
          />
          {billingType === 'recurring' && tier && (
            <span className="text-[11px] px-1.5 py-[2px] rounded-full bg-accent-dim text-accent font-medium shrink-0 tracking-wide uppercase">
              {tier}
            </span>
          )}
        </div>

        {/* Tier selector */}
        {billingType === 'recurring' && tier && availableTiers && availableTiers.length > 0 && (
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

        {/* Pricing / Topup card — billing type is the first row */}
        <div>
          <label className={sectionClass}>{billingType === 'recurring' ? t('form.pricingSection') : t('form.topupSection')}</label>
          <div className="mac-field overflow-hidden">
            <FormRow label={t('form.billingType')}>
              <SegmentedControl
                options={[
                  { value: 'recurring' as BillingType, label: t('form.billingRecurring') },
                  { value: 'prepaid' as BillingType, label: t('form.billingPrepaid') },
                ]}
                value={billingType}
                onChange={setBillingType}
              />
            </FormRow>

            {billingType === 'recurring' ? (
              <>
                <FormRow label={t('form.amount')} error={validationErrors.has('amount')}>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) {
                        setAmount(v)
                        setValidationErrors((prev) => { const n = new Set(prev); n.delete('amount'); return n })
                      }
                    }}
                    placeholder="0.00"
                    step="1"
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
              </>
            ) : (
              <>
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
                <FormRow label={t('form.topupTotal')} last={!editing}>
                  <span className="font-numeric text-[13px] text-text-primary">
                    {formatAmount(topupTotal, currency)}
                  </span>
                </FormRow>
                {editing && (
                  <FormRow label={`${topups.length} ${t('form.topupRecords')}`} last>
                    <button
                      onClick={() => setStep('topups')}
                      className="flex items-center gap-0.5 text-[12px] text-accent cursor-default hover:text-accent/80 transition-colors"
                    >
                      {t('form.viewHistory')}
                      <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4.5 2.5l4 3.5-4 3.5" />
                      </svg>
                    </button>
                  </FormRow>
                )}
              </>
            )}
          </div>
        </div>

        {billingType === 'recurring' && (
          <div>
            <label className={sectionClass}>{t('form.billingSection')}</label>
            <div className="mac-field overflow-hidden">
                <FormRow label={t('form.autoRenew')}>
                  <button
                    type="button"
                    onClick={() => setAutoRenew(!autoRenew)}
                    className={`relative w-[34px] h-[20px] rounded-full transition-colors duration-200 cursor-default ${autoRenew ? 'bg-accent' : 'bg-white/[0.15]'}`}
                  >
                    <div
                      className="absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                      style={{ transform: autoRenew ? 'translateX(14px)' : 'translateX(0)' }}
                    />
                  </button>
                </FormRow>
                <FormRow label={autoRenew ? t('form.nextBilling') : t('form.expiryDate')} last>
                  <input
                    type="date"
                    value={nextBilling}
                    onChange={(e) => setNextBilling(e.target.value)}
                    className="bg-transparent text-[13px] font-numeric text-text-primary text-right outline-none min-w-0 placeholder:text-text-tertiary"
                  />
                </FormRow>
              </div>
            </div>
        )}

        {/* Payment card (shared) */}
        <div>
          <label className={sectionClass}>{t('form.paymentChannel')}</label>
          <div className="mac-field overflow-hidden">
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
                className="mac-button mac-button-secondary text-[13px] py-[7px] px-3 text-text-tertiary hover:text-red-400 hover:border-red-500/20 cursor-default"
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
