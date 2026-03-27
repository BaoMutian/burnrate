import { useState, useEffect, useCallback } from 'react'
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
  const { settings, exchangeRates, updateSetting } = useSettings()
  const { subscriptions, monthlyTotal, yearlyTotal, activeCount, addSubscription, updateSubscription, deleteSubscription } = useSubscriptions(settings.display_currency, exchangeRates)
  const [view, setView] = useState<View>('list')
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)

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
    if (view === 'edit' && editingSubscription) {
      await updateSubscription(editingSubscription.id, data)
    } else {
      await addSubscription(data)
    }
    setView('list')
    setEditingSubscription(null)
  }, [view, editingSubscription, addSubscription, updateSubscription])

  const handleDelete = useCallback(async () => {
    if (editingSubscription) {
      await deleteSubscription(editingSubscription.id)
      setView('list')
      setEditingSubscription(null)
    }
  }, [editingSubscription, deleteSubscription])

  return (
    <div className="w-[360px] h-[520px] bg-bg-primary rounded-[--radius-panel] border border-border shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-panel-in">
      {view === 'settings' ? (
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
        />
      ) : (
        <>
          <OverviewRow
            monthlyTotal={monthlyTotal}
            yearlyTotal={yearlyTotal}
            activeCount={activeCount}
            currency={settings.display_currency}
          />

          <div className="border-t border-border" />

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
