import { useState, useEffect, useCallback, useMemo } from 'react'
import { invoke } from '@tauri-apps/api/core'
import type { Subscription } from '../types'
import {
  getAllSubscriptions,
  addSubscription as dbAdd,
  updateSubscription as dbUpdate,
  deleteSubscription as dbDelete,
  reorderSubscriptions as dbReorder,
} from '../lib/db'
import { toMonthly, toDaily, spentSinceStart, formatAmount, advanceBillingDate } from '../lib/format'
import { type ExchangeRates, convertAmount } from '../lib/currency'

export function useSubscriptions(displayCurrency: string, exchangeRates: ExchangeRates | null) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const subs = await getAllSubscriptions()

      // Auto-advance past billing dates
      const updated = await Promise.all(
        subs.map(async (sub) => {
          const advanced = advanceBillingDate(sub.next_billing, sub.cycle)
          if (advanced !== sub.next_billing) {
            await dbUpdate(sub.id, { next_billing: advanced })
            return { ...sub, next_billing: advanced }
          }
          return sub
        })
      )

      setSubscriptions(updated)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Convert a single subscription's amount to display currency
  const toDisplay = useCallback((amount: number, currency: string) => {
    if (currency === displayCurrency) return amount
    if (!exchangeRates) return amount
    return convertAmount(amount, currency, exchangeRates)
  }, [displayCurrency, exchangeRates])

  const monthlyTotal = useMemo(() =>
    subscriptions.reduce(
      (sum, sub) => sum + toDisplay(toMonthly(sub.amount, sub.cycle), sub.currency),
      0
    ),
    [subscriptions, toDisplay]
  )

  const cumulativeTotal = useMemo(() =>
    subscriptions.reduce(
      (sum, sub) => sum + toDisplay(
        spentSinceStart(sub.amount, sub.next_billing, sub.cycle, sub.created_at),
        sub.currency
      ),
      0
    ),
    [subscriptions, toDisplay]
  )

  const dailyAverage = useMemo(() => toDaily(monthlyTotal), [monthlyTotal])

  const activeCount = subscriptions.length

  // Sync tray title
  useEffect(() => {
    const title = `${formatAmount(monthlyTotal, displayCurrency)}/mo`
    invoke('update_tray_title', { title }).catch(() => {})
  }, [monthlyTotal, displayCurrency])

  const addSubscription = useCallback(async (sub: Parameters<typeof dbAdd>[0]) => {
    await dbAdd(sub)
    await load()
  }, [load])

  const updateSubscription = useCallback(async (id: string, sub: Partial<Subscription>) => {
    await dbUpdate(id, sub)
    await load()
  }, [load])

  const deleteSubscription = useCallback(async (id: string) => {
    await dbDelete(id)
    await load()
  }, [load])

  const reorderSubscriptions = useCallback(async (orderedIds: string[]) => {
    setSubscriptions((prev) => {
      const byId = new Map(prev.map((sub) => [sub.id, sub]))
      return orderedIds
        .map((id, index) => {
          const sub = byId.get(id)
          return sub ? { ...sub, sort_order: index + 1 } : null
        })
        .filter((sub): sub is Subscription => sub !== null)
    })

    try {
      await dbReorder(orderedIds)
    } catch (error) {
      await load()
      throw error
    }
  }, [load])

  return {
    subscriptions,
    loading,
    monthlyTotal,
    cumulativeTotal,
    dailyAverage,
    activeCount,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    reorderSubscriptions,
    reload: load,
  }
}
