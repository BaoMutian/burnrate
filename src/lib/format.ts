import type { BillingCycle } from '../types'
import i18n from '../i18n'

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  zh: 'zh-CN',
}

export function toMonthly(amount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'yearly': return amount / 12
    case 'weekly': return amount * (52 / 12)
    default: return amount
  }
}

export function toYearly(amount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'monthly': return amount * 12
    case 'weekly': return amount * 52
    default: return amount
  }
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

/** Count days from today to given date (negative = overdue) */
export function daysUntil(dateStr: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = parseLocalDate(dateStr)
  return Math.round((target.getTime() - now.getTime()) / 86400000)
}

/**
 * Count how many times a subscription has billed since Jan 1 of the current year,
 * up to and including today. Works backwards from nextBilling to find past billing dates.
 */
export function spentThisYear(amount: number, nextBilling: string, cycle: BillingCycle): number {
  const now = new Date()
  now.setHours(23, 59, 59, 999)
  const yearStart = new Date(now.getFullYear(), 0, 1)

  // Step backwards from nextBilling to find the most recent past billing
  const d = parseLocalDate(nextBilling)

  // First, rewind d to before or at today
  while (d > now) {
    stepBack(d, cycle)
  }

  // Now count how many billing dates fall within [yearStart, now]
  let count = 0
  while (d >= yearStart) {
    count++
    stepBack(d, cycle)
  }

  return count * amount
}

/**
 * Count how much a subscription has billed since it was created (cumulative total).
 * Works backwards from nextBilling to find all billing dates >= createdAt.
 */
export function spentSinceStart(amount: number, nextBilling: string, cycle: BillingCycle, createdAt: string): number {
  const now = new Date()
  now.setHours(23, 59, 59, 999)
  const start = parseLocalDate(createdAt.split('T')[0])

  const d = parseLocalDate(nextBilling)

  while (d > now) {
    stepBack(d, cycle)
  }

  let count = 0
  while (d >= start) {
    count++
    stepBack(d, cycle)
  }

  return count * amount
}

/** Daily average from monthly total */
export function toDaily(monthlyTotal: number): number {
  return monthlyTotal * 12 / 365.25
}

function stepBack(d: Date, cycle: BillingCycle) {
  if (cycle === 'monthly') d.setMonth(d.getMonth() - 1)
  else if (cycle === 'yearly') d.setFullYear(d.getFullYear() - 1)
  else if (cycle === 'weekly') d.setDate(d.getDate() - 7)
}

export function advanceBillingDate(nextBilling: string, cycle: BillingCycle): string {
  const next = parseLocalDate(nextBilling)
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  while (next < now) {
    if (cycle === 'monthly') next.setMonth(next.getMonth() + 1)
    else if (cycle === 'yearly') next.setFullYear(next.getFullYear() + 1)
    else if (cycle === 'weekly') next.setDate(next.getDate() + 7)
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
