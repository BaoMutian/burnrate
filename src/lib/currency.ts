import { getExchangeRate, setExchangeRate } from './db'

// Hardcoded fallback rates (to USD)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CNY: 7.24,
  JPY: 149.5,
  CAD: 1.36,
  AUD: 1.53,
  KRW: 1350,
  HKD: 7.82,
  TWD: 32.2,
}

export type ExchangeRates = Record<string, number>

/**
 * Fetch live exchange rates for a base currency from open.er-api.com.
 * On success, cache all rates in SQLite. On failure, return cached or fallback rates.
 */
export async function fetchExchangeRates(baseCurrency: string): Promise<ExchangeRates> {
  try {
    const resp = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`)
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const data = await resp.json()
    if (data.result !== 'success') throw new Error('API error')

    const rates: ExchangeRates = data.rates as ExchangeRates

    // Cache rates in DB
    const entries = Object.entries(rates)
    await Promise.all(
      entries.map(([to, rate]) => setExchangeRate(baseCurrency, to, rate))
    )

    return rates
  } catch {
    // Try cached rates from DB
    return getCachedOrFallbackRates(baseCurrency)
  }
}

async function getCachedOrFallbackRates(baseCurrency: string): Promise<ExchangeRates> {
  const currencies = Object.keys(FALLBACK_RATES)
  const rates: ExchangeRates = {}

  for (const to of currencies) {
    if (to === baseCurrency) {
      rates[to] = 1
      continue
    }
    const cached = await getExchangeRate(baseCurrency, to)
    if (cached !== null) {
      rates[to] = cached
    }
  }

  // If we got some cached rates, use them
  if (Object.keys(rates).length > 1) return rates

  // Otherwise compute from hardcoded USD-based rates
  return computeFallbackRates(baseCurrency)
}

function computeFallbackRates(baseCurrency: string): ExchangeRates {
  const baseToUsd = FALLBACK_RATES[baseCurrency] ?? 1
  const rates: ExchangeRates = {}
  for (const [currency, usdRate] of Object.entries(FALLBACK_RATES)) {
    // rate = how many units of `currency` per 1 unit of `baseCurrency`
    rates[currency] = usdRate / baseToUsd
  }
  return rates
}

/** Convert an amount from one currency to another using the provided rates (keyed by target base). */
export function convertAmount(amount: number, fromCurrency: string, rates: ExchangeRates): number {
  if (!rates[fromCurrency]) return amount
  // rates are "1 base = X foreign", so to convert foreign → base: amount / rate
  return amount / rates[fromCurrency]
}
