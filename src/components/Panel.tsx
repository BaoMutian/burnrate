import { useState, useEffect, useCallback, useRef } from 'react'
import type { Subscription } from '../types'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { useSettings } from '../hooks/useSettings'
import OverviewRow from './OverviewRow'
import CategoryBar from './CategoryBar'
import SubscriptionList from './SubscriptionList'
import Footer from './Footer'
import AddSubscription from './AddSubscription'
import Settings from './Settings'

type View = 'list' | 'add' | 'edit' | 'settings'

export default function Panel() {
  const { settings, loading: settingsLoading, exchangeRates, ratesLoading, updateSetting } = useSettings()
  const { subscriptions, loading: subsLoading, monthlyTotal, cumulativeTotal, dailyAverage, activeCount, addSubscription, updateSubscription, deleteSubscription } = useSubscriptions(settings.display_currency, exchangeRates)
  const [view, setView] = useState<View>('list')
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)

  const isLoading = settingsLoading || subsLoading
  const [saveError, setSaveError] = useState(false)
  const errorTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey && e.key === 'n') {
        e.preventDefault()
        setView('add')
      }
      if (e.metaKey && e.key === ',') {
        e.preventDefault()
        setView('settings')
      }
      if (e.key === 'Escape') {
        if (view !== 'list') {
          setView('list')
          setEditingSubscription(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view])

  const handleEdit = useCallback((sub: Subscription) => {
    setEditingSubscription(sub)
    setView('edit')
  }, [])

  const handleSave = useCallback(async (data: Parameters<typeof addSubscription>[0]) => {
    try {
      if (view === 'edit' && editingSubscription) {
        await updateSubscription(editingSubscription.id, data)
      } else {
        await addSubscription(data)
      }
      setView('list')
      setEditingSubscription(null)
    } catch {
      setSaveError(true)
      clearTimeout(errorTimer.current)
      errorTimer.current = setTimeout(() => setSaveError(false), 2000)
    }
  }, [view, editingSubscription, addSubscription, updateSubscription])

  const handleDelete = useCallback(async () => {
    if (editingSubscription) {
      await deleteSubscription(editingSubscription.id)
      setView('list')
      setEditingSubscription(null)
    }
  }, [editingSubscription, deleteSubscription])

  return (
    <div className="relative w-full h-full bg-bg-primary rounded-[var(--radius-panel)] border border-white/[0.10] shadow-[0_12px_32px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col overflow-hidden animate-panel-in">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[12px] text-text-secondary animate-pulse">Loading...</div>
        </div>
      ) : view === 'settings' ? (
        <Settings
          settings={settings}
          onUpdate={updateSetting}
          onBack={() => setView('list')}
        />
      ) : view === 'add' || view === 'edit' ? (
        <AddSubscription
          editing={view === 'edit' ? editingSubscription : null}
          onSave={handleSave}
          onDelete={view === 'edit' ? handleDelete : undefined}
          onCancel={() => { setView('list'); setEditingSubscription(null) }}
          saveError={saveError}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
            <h1 className="text-[13px] font-bold text-text-primary tracking-tight">BurnRate</h1>
            <button
              onClick={() => setView('add')}
              className="w-6 h-6 rounded-md flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/[0.06] transition-colors cursor-default"
            >
              <span className="text-[15px] leading-none font-light">+</span>
            </button>
          </div>

          {/* Stats cards */}
          <OverviewRow
            monthlyTotal={monthlyTotal}
            cumulativeTotal={cumulativeTotal}
            dailyAverage={dailyAverage}
            activeCount={activeCount}
            currency={settings.display_currency}
            ratesLoading={ratesLoading}
          />

          {/* Category breakdown */}
          <CategoryBar
            subscriptions={subscriptions}
            displayCurrency={settings.display_currency}
            exchangeRates={exchangeRates}
          />

          {/* Divider */}
          <div className="mx-3 border-t border-border" />

          {/* Subscription list */}
          <SubscriptionList
            subscriptions={subscriptions}
            sortBy={settings.sort_by}
            onSortChange={(sort) => updateSetting('sort_by', sort)}
            onEdit={handleEdit}
          />

          <Footer
            onAdd={() => setView('add')}
            onSettings={() => setView('settings')}
          />
        </>
      )}
    </div>
  )
}
