import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SubscriptionList from '../SubscriptionList'
import type { Subscription } from '../../types'
import '../../i18n'

function makeSub(id: string, overrides: Partial<Subscription> = {}): Subscription {
  return {
    id,
    name: `Service ${id}`,
    icon_key: null,
    sort_order: Number(id),
    amount: 10,
    currency: 'USD',
    cycle: 'monthly',
    tier: null,
    next_billing: '2026-04-01',
    payment_channel: null,
    is_active: 1,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    ...overrides,
  }
}

describe('SubscriptionList', () => {
  const defaultProps = {
    onSortChange: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onReorder: vi.fn(),
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-23T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders empty state when no subscriptions', () => {
    render(
      <SubscriptionList subscriptions={[]} sortBy="next_billing" {...defaultProps} />
    )
    expect(screen.getByText('No subscriptions yet')).toBeInTheDocument()
    expect(screen.getByText('Add your first subscription')).toBeInTheDocument()
  })

  it('renders subscription rows', () => {
    const subs = [makeSub('1', { name: 'GitHub' }), makeSub('2', { name: 'Vercel' })]
    render(
      <SubscriptionList subscriptions={subs} sortBy="next_billing" {...defaultProps} />
    )
    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('Vercel')).toBeInTheDocument()
  })

  it('sorts by next_billing date ascending', () => {
    const subs = [
      makeSub('1', { name: 'Later', next_billing: '2026-05-01' }),
      makeSub('2', { name: 'Sooner', next_billing: '2026-04-01' }),
    ]
    render(
      <SubscriptionList subscriptions={subs} sortBy="next_billing" {...defaultProps} />
    )
    const buttons = screen.getAllByRole('button')
    const textContents = buttons.map((b) => b.textContent || '')
    const soonerIdx = textContents.findIndex((t) => t.includes('Sooner'))
    const laterIdx = textContents.findIndex((t) => t.includes('Later'))
    expect(soonerIdx).toBeLessThan(laterIdx)
  })

  it('sorts by amount descending', () => {
    const subs = [
      makeSub('1', { name: 'Cheap', amount: 5 }),
      makeSub('2', { name: 'Expensive', amount: 50 }),
    ]
    render(
      <SubscriptionList subscriptions={subs} sortBy="amount" {...defaultProps} />
    )
    const buttons = screen.getAllByRole('button')
    const textContents = buttons.map((b) => b.textContent || '')
    const expensiveIdx = textContents.findIndex((t) => t.includes('Expensive'))
    const cheapIdx = textContents.findIndex((t) => t.includes('Cheap'))
    expect(expensiveIdx).toBeLessThan(cheapIdx)
  })

  it('shows sort toggle button', () => {
    render(
      <SubscriptionList subscriptions={[makeSub('1')]} sortBy="next_billing" {...defaultProps} />
    )
    expect(screen.getByText('By date')).toBeInTheDocument()
  })

  it('toggles sort on click', () => {
    const onSortChange = vi.fn()
    render(
      <SubscriptionList subscriptions={[makeSub('1')]} sortBy="next_billing" {...defaultProps} onSortChange={onSortChange} />
    )
    fireEvent.click(screen.getByText('By date'))
    expect(onSortChange).toHaveBeenCalledWith('amount')
  })

  it('shows "By amount" when currently sorting by amount', () => {
    render(
      <SubscriptionList subscriptions={[makeSub('1')]} sortBy="amount" {...defaultProps} />
    )
    expect(screen.getByText('By amount')).toBeInTheDocument()
  })

  it('shows "Manual" when currently sorting manually', () => {
    render(
      <SubscriptionList subscriptions={[makeSub('1')]} sortBy="manual" {...defaultProps} />
    )
    expect(screen.getByText('Manual')).toBeInTheDocument()
  })

  it('calls onEdit when a row is clicked', () => {
    const onEdit = vi.fn()
    const sub = makeSub('1', { name: 'GitHub' })
    render(
      <SubscriptionList subscriptions={[sub]} sortBy="next_billing" {...defaultProps} onEdit={onEdit} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'GitHub' }))
    expect(onEdit).toHaveBeenCalledWith(sub)
  })
})
