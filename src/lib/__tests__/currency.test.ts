import { describe, it, expect, vi, beforeEach } from 'vitest'
import { convertAmount, fetchExchangeRates, type ExchangeRates } from '../currency'

// Mock db module
vi.mock('../db', () => ({
  getExchangeRate: vi.fn().mockResolvedValue(null),
  setExchangeRate: vi.fn().mockResolvedValue(undefined),
}))

describe('convertAmount', () => {
  // Rates as returned by fetchExchangeRates(baseCurrency='USD'):
  // "1 USD = X foreign", so to convert foreign → USD: amount / rate
  const rates: ExchangeRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    CNY: 7.24,
    JPY: 149.5,
  }

  it('returns same amount when fromCurrency matches base (rate = 1)', () => {
    expect(convertAmount(100, 'USD', rates)).toBe(100)
  })

  it('converts EUR to USD correctly', () => {
    // 100 EUR → USD: 100 / 0.92 ≈ 108.70
    const result = convertAmount(100, 'EUR', rates)
    expect(result).toBeCloseTo(108.70, 1)
  })

  it('converts CNY to USD correctly', () => {
    // 724 CNY → USD: 724 / 7.24 = 100
    expect(convertAmount(724, 'CNY', rates)).toBeCloseTo(100, 1)
  })

  it('converts JPY to USD correctly', () => {
    // 1495 JPY → USD: 1495 / 149.5 = 10
    expect(convertAmount(1495, 'JPY', rates)).toBeCloseTo(10, 1)
  })

  it('returns amount unchanged when currency not in rates', () => {
    expect(convertAmount(50, 'KRW', rates)).toBe(50)
  })

  it('handles zero amount', () => {
    expect(convertAmount(0, 'EUR', rates)).toBe(0)
  })

  it('handles fractional amounts', () => {
    const result = convertAmount(9.99, 'EUR', rates)
    expect(result).toBeCloseTo(9.99 / 0.92, 2)
  })
})

describe('fetchExchangeRates', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns API rates on success', async () => {
    const mockRates = { USD: 1, EUR: 0.91, CNY: 7.2 }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: 'success', rates: mockRates }),
    })

    const rates = await fetchExchangeRates('USD')
    expect(rates).toEqual(mockRates)
    expect(fetch).toHaveBeenCalledWith('https://open.er-api.com/v6/latest/USD')
  })

  it('falls back to hardcoded rates on network failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const rates = await fetchExchangeRates('USD')
    // Should get fallback rates with USD = 1
    expect(rates.USD).toBe(1)
    expect(rates.EUR).toBeCloseTo(0.92, 2)
    expect(rates.CNY).toBeCloseTo(7.24, 2)
  })

  it('falls back on non-ok HTTP response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })

    const rates = await fetchExchangeRates('USD')
    expect(rates.USD).toBe(1)
  })

  it('falls back on API error result', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: 'error' }),
    })

    const rates = await fetchExchangeRates('USD')
    expect(rates.USD).toBe(1)
  })

  it('computes cross-rates when base is not USD', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('offline'))

    const rates = await fetchExchangeRates('EUR')
    // EUR fallback = 0.92, so 1 EUR = X foreign means X = foreign_usd_rate / eur_usd_rate
    expect(rates.EUR).toBe(1)
    expect(rates.USD).toBeCloseTo(1 / 0.92, 2)
    expect(rates.CNY).toBeCloseTo(7.24 / 0.92, 1)
  })
})
