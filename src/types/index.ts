export type BillingCycle = 'monthly' | 'yearly' | 'weekly'

export interface Subscription {
  id: string
  name: string
  icon_key: string | null
  amount: number
  currency: string
  cycle: BillingCycle
  tier: string | null
  next_billing: string // YYYY-MM-DD
  payment_channel: string | null
  is_active: number // SQLite boolean: 0 | 1
  created_at: string
  updated_at: string
}

export interface Settings {
  display_currency: string
  language: 'en' | 'zh'
  sort_by: 'next_billing' | 'amount'
}

export interface ExchangeRate {
  from_currency: string
  to_currency: string
  rate: number
  updated_at: string
}

export interface PriceTier {
  name: string
  amount: number
  currency: string
  cycle: BillingCycle
}

export interface ServicePreset {
  name: string
  iconKey: string | null
  defaultAmount: number
  defaultCurrency: string
  defaultCycle: BillingCycle
  tiers?: PriceTier[]
  category: string
}
