import { useState, useEffect, useCallback, useRef } from 'react'
import type { Subscription } from '../types'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { useSettings } from '../hooks/useSettings'
import OverviewRow from './OverviewRow'
import SubscriptionList from './SubscriptionList'
import Footer from './Footer'
import AddSubscription from './AddSubscription'
import Settings from './Settings'

type View = 'list' | 'add' | 'edit' | 'settings'

export default function Panel() {
  const { settings, loading: settingsLoading, exchangeRates, ratesLoading, updateSetting } = useSettings()
  const { subscriptions, loading: subsLoading, monthlyTotal, yearlyTotal, activeCount, addSubscription, updateSubscription, deleteSubscription } = useSubscriptions(settings.display_currency, exchangeRates)
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
    <div className="relative w-[360px] h-[520px] bg-bg-primary rounded-[--radius-panel] border border-border shadow-[0_8px_40px_rgba(0,0,0,0.65),0_2px_8px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-panel-in panel-noise panel-highlight">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-text-tertiary animate-pulse">Loading...</div>
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
          <OverviewRow
            monthlyTotal={monthlyTotal}
            yearlyTotal={yearlyTotal}
            activeCount={activeCount}
            currency={settings.display_currency}
            ratesLoading={ratesLoading}
          />

          <div className="mx-5 border-t border-border" />

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
