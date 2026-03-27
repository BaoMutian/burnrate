import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LogicalSize } from '@tauri-apps/api/dpi'
import { getCurrentWindow } from '@tauri-apps/api/window'
import type { Subscription } from '../types'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { useSettings } from '../hooks/useSettings'
import OverviewRow from './OverviewRow'
import CategoryBar from './CategoryBar'
import SubscriptionList from './SubscriptionList'
import AddSubscription from './AddSubscription'
import Settings from './Settings'

type View = 'list' | 'add' | 'edit' | 'settings'

const PANEL_WIDTH = 300
const PANEL_MAX_HEIGHT = 500
const PANEL_MIN_LIST_HEIGHT = 220
const appWindow = getCurrentWindow()

function HeaderActionButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className="w-7 h-7 rounded-[10px] flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/[0.06] transition-colors cursor-default"
    >
      {children}
    </button>
  )
}

export default function Panel() {
  const { t } = useTranslation()
  const { settings, loading: settingsLoading, exchangeRates, ratesLoading, updateSetting } = useSettings()
  const { subscriptions, loading: subsLoading, monthlyTotal, cumulativeTotal, dailyAverage, activeCount, addSubscription, updateSubscription, deleteSubscription } = useSubscriptions(settings.display_currency, exchangeRates)
  const [view, setView] = useState<View>('list')
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)

  const isLoading = settingsLoading || subsLoading
  const [saveError, setSaveError] = useState(false)
  const [listMaxHeight, setListMaxHeight] = useState(PANEL_MAX_HEIGHT)
  const errorTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const panelRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const overviewRef = useRef<HTMLDivElement>(null)
  const categoryRef = useRef<HTMLDivElement>(null)
  const dividerRef = useRef<HTMLDivElement>(null)
  const lastWindowHeight = useRef<number | null>(null)

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

  const resizeWindow = useCallback(async (height: number) => {
    const nextHeight = Math.round(Math.min(PANEL_MAX_HEIGHT, Math.max(PANEL_MIN_LIST_HEIGHT, height)))
    if (lastWindowHeight.current === nextHeight) return
    lastWindowHeight.current = nextHeight
    await appWindow.setSize(new LogicalSize(PANEL_WIDTH, nextHeight)).catch(() => {})
  }, [])

  useEffect(() => {
    if (isLoading || view !== 'list') {
      void resizeWindow(PANEL_MAX_HEIGHT)
      return
    }

    const staticHeight = [
      headerRef.current?.offsetHeight ?? 0,
      overviewRef.current?.offsetHeight ?? 0,
      categoryRef.current?.offsetHeight ?? 0,
      dividerRef.current?.offsetHeight ?? 0,
    ].reduce((sum, height) => sum + height, 0)

    const availableListHeight = Math.max(120, PANEL_MAX_HEIGHT - staticHeight)
    setListMaxHeight((prev) => Math.abs(prev - availableListHeight) > 1 ? availableListHeight : prev)
  }, [isLoading, view, subscriptions.length, settings.sort_by, ratesLoading, resizeWindow])

  useEffect(() => {
    if (isLoading || view !== 'list' || !panelRef.current) {
      return
    }

    const syncWindowHeight = () => {
      if (!panelRef.current) return
      void resizeWindow(panelRef.current.scrollHeight)
    }

    syncWindowHeight()

    const observer = new ResizeObserver(() => {
      syncWindowHeight()
    })

    observer.observe(panelRef.current)
    return () => observer.disconnect()
  }, [isLoading, view, listMaxHeight, resizeWindow, subscriptions.length])

  return (
    <div
      ref={panelRef}
      className={`relative w-full ${!isLoading && view === 'list' ? 'h-auto' : 'h-full'} bg-bg-primary rounded-[var(--radius-panel)] border border-white/[0.10] shadow-[0_12px_32px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col overflow-hidden animate-panel-in origin-top`}
    >
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[13px] text-text-secondary animate-pulse">{t('common.loading')}</div>
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
          <div ref={headerRef} className="flex items-center justify-between px-3 pt-3 pb-2">
            <h1 className="text-[14px] font-bold text-text-primary tracking-tight">BurnRate</h1>
            <div className="flex items-center gap-1">
              <HeaderActionButton label={t('settings.title')} onClick={() => setView('settings')}>
                <svg viewBox="0 0 24 24" className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="3.1" />
                  <path d="M12 2.75v2.1M12 19.15v2.1M4.93 4.93l1.48 1.48M17.59 17.59l1.48 1.48M2.75 12h2.1M19.15 12h2.1M4.93 19.07l1.48-1.48M17.59 6.41l1.48-1.48" />
                </svg>
              </HeaderActionButton>
              <HeaderActionButton label={t('form.add')} onClick={() => setView('add')}>
                <svg viewBox="0 0 24 24" className="w-[16px] h-[16px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </HeaderActionButton>
            </div>
          </div>

          {/* Stats cards */}
          <div ref={overviewRef}>
            <OverviewRow
              monthlyTotal={monthlyTotal}
              cumulativeTotal={cumulativeTotal}
              dailyAverage={dailyAverage}
              activeCount={activeCount}
              currency={settings.display_currency}
              ratesLoading={ratesLoading}
            />
          </div>

          {/* Category breakdown */}
          <div ref={categoryRef}>
            <CategoryBar
              subscriptions={subscriptions}
              displayCurrency={settings.display_currency}
              exchangeRates={exchangeRates}
            />
          </div>

          {/* Divider */}
          <div ref={dividerRef} className="mx-3 border-t border-border" />

          {/* Subscription list */}
          <SubscriptionList
            subscriptions={subscriptions}
            sortBy={settings.sort_by}
            onSortChange={(sort) => updateSetting('sort_by', sort)}
            onEdit={handleEdit}
            maxHeight={listMaxHeight}
          />
        </>
      )}
    </div>
  )
}
