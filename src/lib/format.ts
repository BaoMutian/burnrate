import type { BillingCycle } from '../types'
import i18n from '../i18n'

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  zh: 'zh-CN',
}

const CYCLE_MONTHS: Record<BillingCycle, number> = {
  weekly: 12 / 52,
  monthly: 1,
  quarterly: 3,
  biannual: 6,
  nine_monthly: 9,
  yearly: 12,
}

export function toMonthly(amount: number, cycle: BillingCycle): number {
  return amount / CYCLE_MONTHS[cycle]
}

export function toYearly(amount: number, cycle: BillingCycle): number {
  return amount * (12 / CYCLE_MONTHS[cycle])
}

export function formatAmount(amount: number, currency: string): string {
  const locale = LOCALE_MAP[i18n.language] || 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).formatToParts(amount).map((part) => {
    if (part.type !== 'currency') return part.value
    return part.value.replace(/^[A-Z]{1,3}/, '')
  }).join('')
}

/** Parse a YYYY-MM-DD string as local midnight (not UTC). */
function parseLocalDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

export function relativeDate(dateStr: string, t: (key: string, opts?: Record<string, unknown>) => string): string {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = parseLocalDate(dateStr)
  const diffMs = target.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / 86400000)

  if (diffDays < 0) return t('time.overdue')
  if (diffDays === 0) return t('time.today')
  if (diffDays === 1) return t('time.tomorrow')
  if (diffDays < 14) return t('time.days', { count: diffDays })
  if (diffDays < 60) return t('time.weeks', { count: Math.floor(diffDays / 7) })
  return t('time.months', { count: Math.floor(diffDays / 30) })
}

/** Format date as compact M/D, e.g. "3/28" */
export function shortDate(dateStr: string): string {
  const d = parseLocalDate(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

/** Format date as "Mon DD", e.g. "Mar 28" — locale-aware */
export function mediumDate(dateStr: string): string {
  const d = parseLocalDate(dateStr)
  const locale = LOCALE_MAP[i18n.language] || 'en-US'
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
}

/** Whether a subscription is expired (auto-renew off + past expiry) */
export function isExpired(autoRenew: number, nextBilling: string): boolean {
  if (autoRenew) return false
  return daysUntil(nextBilling) < 0
}

/** Count days from today to given date (negative = overdue) */
export function daysUntil(dateStr: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = parseLocalDate(dateStr)
  return Math.round((target.getTime() - now.getTime()) / 86400000)
}

/** Daily average from monthly total */
export function toDaily(monthlyTotal: number): number {
  return monthlyTotal * 12 / 365.25
}

export function advanceBillingDate(nextBilling: string, cycle: BillingCycle): string {
  const next = parseLocalDate(nextBilling)
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  while (next < now) {
    if (cycle === 'weekly') next.setDate(next.getDate() + 7)
    else next.setMonth(next.getMonth() + CYCLE_MONTHS[cycle])
  }

  return formatLocalDate(next)
}

/** Format a Date as YYYY-MM-DD using local timezone components. */
function formatLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Decompose currency formatting into symbol, position, decimal places, and separators. */
export function getCurrencyParts(currency: string): {
  symbol: string
  symbolPosition: 'prefix' | 'suffix'
  decimalPlaces: number
  decimalSeparator: string
  groupSeparator: string
} {
  const locale = LOCALE_MAP[i18n.language] || 'en-US'
  const fmt = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  })

  const parts = fmt.formatToParts(1234.56)
  const currencyPart = parts.find(p => p.type === 'currency')
  const decimalPart = parts.find(p => p.type === 'decimal')
  const groupPart = parts.find(p => p.type === 'group')
  const currencyIndex = parts.findIndex(p => p.type === 'currency')
  const integerIndex = parts.findIndex(p => p.type === 'integer')

  let symbol = currencyPart?.value ?? '$'
  symbol = symbol.replace(/^[A-Z]{1,3}/, '')

  const resolved = fmt.resolvedOptions()

  return {
    symbol,
    symbolPosition: currencyIndex < integerIndex ? 'prefix' : 'suffix',
    decimalPlaces: resolved.maximumFractionDigits ?? 2,
    decimalSeparator: decimalPart?.value ?? '.',
    groupSeparator: groupPart?.value ?? ',',
  }
}
