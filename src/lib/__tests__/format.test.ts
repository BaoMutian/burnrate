import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { toMonthly, toYearly, formatAmount, relativeDate, spentThisYear, advanceBillingDate } from '../format'

const t = (key: string, opts?: Record<string, unknown>) => {
  if (opts?.count !== undefined) return `${key}:${opts.count}`
  return key
}

describe('toMonthly', () => {
  it('returns amount unchanged for monthly cycle', () => {
    expect(toMonthly(10, 'monthly')).toBe(10)
  })

  it('divides yearly amount by 12', () => {
    expect(toMonthly(120, 'yearly')).toBe(10)
    expect(toMonthly(144, 'yearly')).toBe(12)
  })

  it('converts weekly to monthly (×52/12)', () => {
    expect(toMonthly(10, 'weekly')).toBeCloseTo(43.33, 1)
  })

  it('handles zero amount', () => {
    expect(toMonthly(0, 'monthly')).toBe(0)
    expect(toMonthly(0, 'yearly')).toBe(0)
    expect(toMonthly(0, 'weekly')).toBe(0)
  })

  it('handles fractional amounts', () => {
    expect(toMonthly(9.99, 'monthly')).toBe(9.99)
    expect(toMonthly(99.99, 'yearly')).toBeCloseTo(8.33, 1)
  })
})

describe('toYearly', () => {
  it('multiplies monthly by 12', () => {
    expect(toYearly(10, 'monthly')).toBe(120)
  })

  it('returns amount unchanged for yearly cycle', () => {
    expect(toYearly(120, 'yearly')).toBe(120)
  })

  it('multiplies weekly by 52', () => {
    expect(toYearly(10, 'weekly')).toBe(520)
  })
})

describe('formatAmount', () => {
  it('formats USD with dollar sign', () => {
    expect(formatAmount(10, 'USD')).toBe('$10')
  })

  it('shows decimals for fractional amounts', () => {
    expect(formatAmount(10.99, 'USD')).toBe('$10.99')
  })

  it('omits decimals for whole numbers', () => {
    expect(formatAmount(100, 'USD')).toBe('$100')
  })

  it('formats EUR with euro sign', () => {
    const result = formatAmount(25.50, 'EUR')
    expect(result).toContain('25.50')
    expect(result).toContain('€')
  })

  it('formats CNY with yuan sign', () => {
    const result = formatAmount(100, 'CNY')
    expect(result).toContain('100')
    expect(result).toMatch(/CN¥|¥/)
  })

  it('formats large amounts with comma grouping', () => {
    expect(formatAmount(1234, 'USD')).toBe('$1,234')
  })

  it('handles very small amounts', () => {
    expect(formatAmount(0.01, 'USD')).toBe('$0.01')
  })

  it('handles zero', () => {
    expect(formatAmount(0, 'USD')).toBe('$0')
  })
})

describe('relativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-23T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "today" for current date', () => {
    expect(relativeDate('2026-03-23', t)).toBe('time.today')
  })

  it('returns "tomorrow" for next day', () => {
    expect(relativeDate('2026-03-24', t)).toBe('time.tomorrow')
  })

  it('returns days for 2-13 days', () => {
    expect(relativeDate('2026-03-29', t)).toBe('time.days:6')
    expect(relativeDate('2026-03-25', t)).toBe('time.days:2')
  })

  it('returns weeks for 14-59 days', () => {
    expect(relativeDate('2026-04-06', t)).toBe('time.weeks:2')
    expect(relativeDate('2026-04-20', t)).toBe('time.weeks:4')
  })

  it('returns months for 60+ days', () => {
    expect(relativeDate('2026-06-23', t)).toBe('time.months:3')
  })

  it('returns overdue for past dates', () => {
    expect(relativeDate('2026-03-22', t)).toBe('time.overdue')
    expect(relativeDate('2026-01-01', t)).toBe('time.overdue')
  })
})

describe('spentThisYear', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Fixed at 2026-03-23
    vi.setSystemTime(new Date('2026-03-23T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('counts monthly billings since Jan 1', () => {
    // nextBilling is Apr 1 → past billings this year: Mar 1, Feb 1, Jan 1 = 3 times
    expect(spentThisYear(10, '2026-04-01', 'monthly')).toBe(30)
  })

  it('counts monthly billings when next billing is in the past', () => {
    // nextBilling is Mar 15 (already past) → billings: Mar 15, Feb 15, Jan 15 = 3
    expect(spentThisYear(10, '2026-03-15', 'monthly')).toBe(30)
  })

  it('counts today as a billing if nextBilling lands on today', () => {
    // nextBilling is Mar 23 (today) → today counts, plus Feb 23, Jan 23 = 3
    expect(spentThisYear(10, '2026-03-23', 'monthly')).toBe(30)
  })

  it('returns 0 for yearly sub that has not billed this year', () => {
    // nextBilling is Jun 2026 → no billing yet this year
    expect(spentThisYear(120, '2026-06-15', 'yearly')).toBe(0)
  })

  it('counts yearly sub that billed once this year', () => {
    // nextBilling is Feb 2027 → last billing was Feb 2026 → 1 time
    expect(spentThisYear(120, '2027-02-01', 'yearly')).toBe(120)
  })

  it('counts weekly billings since Jan 1', () => {
    // nextBilling is Mar 30 → step back by 7 days from Mar 23:
    // Mar 23, Mar 16, Mar 9, Mar 2, Feb 23, ... Jan 5 (within year)
    // That's about 11-12 weeks from Jan 1 to Mar 23
    const result = spentThisYear(5, '2026-03-30', 'weekly')
    expect(result).toBeGreaterThanOrEqual(55) // at least 11 weeks
    expect(result).toBeLessThanOrEqual(65)    // at most 13 weeks
  })

  it('handles sub that started mid-year', () => {
    // nextBilling is Apr 15 → past billing: Mar 15, Feb 15 = 2 (Jan 15 is before the sub existed if it started Feb)
    // But we don't track start date, so we count all cycle dates that fall in this year
    // Mar 15, Feb 15, Jan 15 = 3
    expect(spentThisYear(20, '2026-04-15', 'monthly')).toBe(60)
  })
})

describe('advanceBillingDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-23T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not advance future dates', () => {
    expect(advanceBillingDate('2026-04-01', 'monthly')).toBe('2026-04-01')
    expect(advanceBillingDate('2026-12-25', 'yearly')).toBe('2026-12-25')
  })

  it('does not advance today', () => {
    expect(advanceBillingDate('2026-03-23', 'monthly')).toBe('2026-03-23')
  })

  it('advances monthly past dates by one month at a time', () => {
    expect(advanceBillingDate('2026-03-01', 'monthly')).toBe('2026-04-01')
    expect(advanceBillingDate('2026-01-15', 'monthly')).toBe('2026-04-15')
  })

  it('advances yearly past dates by one year at a time', () => {
    expect(advanceBillingDate('2025-06-15', 'yearly')).toBe('2026-06-15')
    expect(advanceBillingDate('2024-01-01', 'yearly')).toBe('2027-01-01')
  })

  it('advances weekly past dates by 7 days at a time', () => {
    expect(advanceBillingDate('2026-03-16', 'weekly')).toBe('2026-03-23')
  })

  it('handles dates far in the past', () => {
    expect(advanceBillingDate('2020-01-01', 'yearly')).toBe('2027-01-01')
  })
})
