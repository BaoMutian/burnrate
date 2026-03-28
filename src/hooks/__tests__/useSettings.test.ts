import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSettings } from '../useSettings'

// Mock db
const mockSettings: Record<string, string> = {}
vi.mock('../../lib/db', () => ({
  getSetting: vi.fn((key: string) => Promise.resolve(mockSettings[key] || null)),
  setSetting: vi.fn((key: string, value: string) => {
    mockSettings[key] = value
    return Promise.resolve()
  }),
}))

// Mock currency
const mockFetchRates = vi.fn().mockResolvedValue({ USD: 1, EUR: 0.92 })
vi.mock('../../lib/currency', () => ({
  fetchExchangeRates: (...args: unknown[]) => mockFetchRates(...args),
}))

// Mock i18n
vi.mock('../../i18n', () => ({
  default: {
    changeLanguage: vi.fn(),
  },
}))

describe('useSettings', () => {
  beforeEach(() => {
    // Reset mock state
    Object.keys(mockSettings).forEach((key) => delete mockSettings[key])
    vi.clearAllMocks()
  })

  it('loads default settings when DB is empty', async () => {
    const { result } = renderHook(() => useSettings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.settings.display_currency).toBe('CNY')
      expect(result.current.settings.language).toBe('en')
      expect(result.current.settings.sort_by).toBe('next_billing')
    })
  })

  it('loads persisted settings from DB', async () => {
    mockSettings.display_currency = 'EUR'
    mockSettings.language = 'zh'
    mockSettings.sort_by = 'manual'

    const { result } = renderHook(() => useSettings())

    await waitFor(() => {
      expect(result.current.settings.display_currency).toBe('EUR')
      expect(result.current.settings.language).toBe('zh')
      expect(result.current.settings.sort_by).toBe('manual')
    })
  })

  it('fetches exchange rates on init', async () => {
    const { result } = renderHook(() => useSettings())

    await waitFor(() => {
      expect(mockFetchRates).toHaveBeenCalledWith('CNY')
      expect(result.current.exchangeRates).toEqual({ USD: 1, EUR: 0.92 })
    })
  })

  it('refetches rates when display currency changes', async () => {
    const { result } = renderHook(() => useSettings())

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.updateSetting('display_currency', 'EUR')
    })

    expect(mockFetchRates).toHaveBeenCalledWith('EUR')
  })

  it('updates language and triggers i18n change', async () => {
    const i18n = (await import('../../i18n')).default

    const { result } = renderHook(() => useSettings())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.updateSetting('language', 'zh')
    })

    expect(i18n.changeLanguage).toHaveBeenCalledWith('zh')
    expect(result.current.settings.language).toBe('zh')
  })

  it('persists setting to DB on update', async () => {
    const { setSetting } = await import('../../lib/db')
    const { result } = renderHook(() => useSettings())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.updateSetting('sort_by', 'amount')
    })

    expect(setSetting).toHaveBeenCalledWith('sort_by', 'amount')
  })
})
