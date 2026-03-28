import { useState, useEffect, useCallback, useMemo } from 'react'
import { invoke } from '@tauri-apps/api/core'
import type { Subscription } from '../types'
import {
  getAllSubscriptions,
  addSubscription as dbAdd,
  updateSubscription as dbUpdate,
  deleteSubscription as dbDelete,
  reorderSubscriptions as dbReorder,
  getTopupTotals,
  addTopup as dbAddTopup,
} from '../lib/db'
import { toMonthly, toDaily, formatAmount, advanceBillingDate, isExpired } from '../lib/format'
import { type ExchangeRates, convertAmount } from '../lib/currency'

export function useSubscriptions(displayCurrency: string, exchangeRates: ExchangeRates | null, trayDisplay: 'monthly' | 'daily') {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [topupTotals, setTopupTotals] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [subs, totals] = await Promise.all([
        getAllSubscriptions(),
        getTopupTotals(),
      ])

      // Auto-advance past billing dates (only for auto-renew recurring subscriptions)
      const updated = await Promise.all(
        subs.map(async (sub) => {
          if (sub.billing_type === 'prepaid' || !sub.auto_renew) return sub
          const advanced = advanceBillingDate(sub.next_billing, sub.cycle)
          if (advanced !== sub.next_billing) {
            await dbUpdate(sub.id, { next_billing: advanced })
            return { ...sub, next_billing: advanced }
          }
          return sub
        })
      )

      setSubscriptions(updated)
      setTopupTotals(totals)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Split by billing type first
  const recurringAll = useMemo(() =>
    subscriptions.filter(sub => sub.billing_type !== 'prepaid'),
    [subscriptions]
  )

  const prepaidSubscriptions = useMemo(() =>
    subscriptions.filter(sub => sub.billing_type === 'prepaid'),
    [subscriptions]
  )

  // Then split recurring into active vs archived
  const activeSubscriptions = useMemo(() =>
    recurringAll.filter(sub => !isExpired(sub.auto_renew, sub.next_billing)),
    [recurringAll]
  )

  const archivedSubscriptions = useMemo(() =>
    recurringAll.filter(sub => isExpired(sub.auto_renew, sub.next_billing)),
    [recurringAll]
  )

  // Convert a single subscription's amount to display currency
  const toDisplay = useCallback((amount: number, currency: string) => {
    if (currency === displayCurrency) return amount
    if (!exchangeRates) return amount
    return convertAmount(amount, currency, exchangeRates)
  }, [displayCurrency, exchangeRates])

  // Totals computed from active recurring subscriptions only
  const monthlyTotal = useMemo(() =>
    activeSubscriptions.reduce(
      (sum, sub) => sum + toDisplay(toMonthly(sub.amount, sub.cycle), sub.currency),
      0
    ),
    [activeSubscriptions, toDisplay]
  )

  const cumulativeTotal = useMemo(() =>
    activeSubscriptions.reduce(
      (sum, sub) => sum + toDisplay(sub.amount, sub.currency),
      0
    ),
    [activeSubscriptions, toDisplay]
  )

  const dailyAverage = useMemo(() => toDaily(monthlyTotal), [monthlyTotal])

  const activeCount = activeSubscriptions.length
  const archivedCount = archivedSubscriptions.length
  const prepaidCount = prepaidSubscriptions.length

  // Prepaid total (cumulative top-ups, converted to display currency)
  const prepaidTotal = useMemo(() =>
    prepaidSubscriptions.reduce(
      (sum, sub) => sum + toDisplay(topupTotals.get(sub.id) ?? 0, sub.currency),
      0
    ),
    [prepaidSubscriptions, topupTotals, toDisplay]
  )

  // Sync tray title (active recurring subscriptions only)
  useEffect(() => {
    const value = trayDisplay === 'daily' ? dailyAverage : monthlyTotal
    const suffix = trayDisplay === 'daily' ? '/d' : '/m'
    const title = `${formatAmount(value, displayCurrency)}${suffix}`
    invoke('update_tray_title', { title }).catch(() => {})
  }, [monthlyTotal, dailyAverage, displayCurrency, trayDisplay])

  const addSubscription = useCallback(async (sub: Parameters<typeof dbAdd>[0], initialTopup?: number) => {
    const id = await dbAdd(sub)
    if (initialTopup && initialTopup > 0) {
      await dbAddTopup(id, initialTopup, sub.currency, null)
    }
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
    subscriptions: activeSubscriptions,
    archivedSubscriptions,
    prepaidSubscriptions,
    topupTotals,
    loading,
    monthlyTotal,
    cumulativeTotal,
    dailyAverage,
    prepaidTotal,
    activeCount,
    archivedCount,
    prepaidCount,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    reorderSubscriptions,
    reload: load,
  }
}
