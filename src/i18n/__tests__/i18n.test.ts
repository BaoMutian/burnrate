import { describe, it, expect } from 'vitest'
import en from '../en.json'
import zh from '../zh.json'

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null) {
      keys.push(...flattenKeys(value as Record<string, unknown>, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

describe('i18n translations', () => {
  const enKeys = flattenKeys(en)
  const zhKeys = flattenKeys(zh)

  it('en and zh have the same keys', () => {
    expect(enKeys.sort()).toEqual(zhKeys.sort())
  })

  it('no empty translation values in en', () => {
    for (const key of enKeys) {
      const parts = key.split('.')
      let value: unknown = en
      for (const part of parts) {
        value = (value as Record<string, unknown>)[part]
      }
      expect(value, `en key "${key}" is empty`).toBeTruthy()
    }
  })

  it('no empty translation values in zh', () => {
    for (const key of zhKeys) {
      const parts = key.split('.')
      let value: unknown = zh
      for (const part of parts) {
        value = (value as Record<string, unknown>)[part]
      }
      expect(value, `zh key "${key}" is empty`).toBeTruthy()
    }
  })

  it('interpolation placeholders match between en and zh', () => {
    const placeholderRegex = /\{\{(\w+)\}\}/g

    for (const key of enKeys) {
      const parts = key.split('.')
      let enValue: unknown = en
      let zhValue: unknown = zh
      for (const part of parts) {
        enValue = (enValue as Record<string, unknown>)[part]
        zhValue = (zhValue as Record<string, unknown>)[part]
      }

      const enPlaceholders = [...String(enValue).matchAll(placeholderRegex)].map((m) => m[1]).sort()
      const zhPlaceholders = [...String(zhValue).matchAll(placeholderRegex)].map((m) => m[1]).sort()

      expect(enPlaceholders, `Placeholders mismatch for key "${key}"`).toEqual(zhPlaceholders)
    }
  })

  it('has all required top-level sections', () => {
    const requiredSections = ['overview', 'list', 'time', 'form', 'cycle', 'footer', 'settings']
    for (const section of requiredSections) {
      expect(en).toHaveProperty(section)
      expect(zh).toHaveProperty(section)
    }
  })

  it('has at least 25 translation keys', () => {
    expect(enKeys.length).toBeGreaterThanOrEqual(25)
  })
})
