import { describe, it, expect } from 'vitest'
import { SERVICE_PRESETS } from '../presets'
import type { BillingCycle } from '../../types'

describe('SERVICE_PRESETS', () => {
  it('has at least 30 presets', () => {
    expect(SERVICE_PRESETS.length).toBeGreaterThanOrEqual(30)
  })

  it('every preset has required fields', () => {
    for (const preset of SERVICE_PRESETS) {
      expect(preset.name).toBeTruthy()
      expect(typeof preset.name).toBe('string')
      expect(preset.defaultAmount).toBeGreaterThan(0)
      expect(typeof preset.defaultCurrency).toBe('string')
      expect(preset.defaultCurrency.length).toBe(3) // ISO currency code
      expect(['monthly', 'yearly', 'weekly'] as BillingCycle[]).toContain(preset.defaultCycle)
      expect(preset.category).toBeTruthy()
    }
  })

  it('has no duplicate names', () => {
    const names = SERVICE_PRESETS.map((p) => p.name)
    const unique = new Set(names)
    expect(unique.size).toBe(names.length)
  })

  it('iconKey is either a string or null', () => {
    for (const preset of SERVICE_PRESETS) {
      expect(preset.iconKey === null || typeof preset.iconKey === 'string').toBe(true)
    }
  })

  it('includes common dev services', () => {
    const names = SERVICE_PRESETS.map((p) => p.name)
    expect(names).toContain('GitHub')
    expect(names).toContain('Vercel')
    expect(names).toContain('Notion')
  })

  it('includes common AI services', () => {
    const names = SERVICE_PRESETS.map((p) => p.name)
    expect(names).toContain('ChatGPT')
    expect(names).toContain('Claude')
  })

  it('includes Chinese services', () => {
    const cnyPresets = SERVICE_PRESETS.filter((p) => p.defaultCurrency === 'CNY')
    expect(cnyPresets.length).toBeGreaterThanOrEqual(3)
  })

  it('has entertainment/media presets', () => {
    const entertainment = SERVICE_PRESETS.filter((p) => p.category === 'entertainment')
    expect(entertainment.length).toBeGreaterThanOrEqual(3)
  })

  it('all currency codes are valid ISO 4217', () => {
    const validCodes = new Set(['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'CAD', 'AUD', 'KRW', 'HKD', 'TWD'])
    for (const preset of SERVICE_PRESETS) {
      expect(validCodes.has(preset.defaultCurrency)).toBe(true)
    }
  })
})
