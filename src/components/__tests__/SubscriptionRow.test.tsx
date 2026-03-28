import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SubscriptionRow from '../SubscriptionRow'
import type { Subscription } from '../../types'
import '../../i18n'

function makeSub(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: 'test-1',
    name: 'GitHub',
    icon_key: null,
    sort_order: 1,
    amount: 4,
    currency: 'USD',
    cycle: 'monthly',
    tier: null,
    next_billing: '2026-04-01',
    payment_channel: 'Visa',
    is_active: 1,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    ...overrides,
  }
}

describe('SubscriptionRow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-23T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders subscription name', () => {
    render(
      <SubscriptionRow
        subscription={makeSub()}
        onClick={vi.fn()}
        onDelete={vi.fn()}
        isDeleteOpen={false}
        onDeleteOpenChange={vi.fn()}
        onReorderStart={vi.fn()}
        onReorderMove={vi.fn()}
        onReorderEnd={vi.fn()}
        isDragging={false}
      />
    )
    expect(screen.getByText('GitHub')).toBeInTheDocument()
  })

  it('renders payment channel', () => {
    render(
      <SubscriptionRow
        subscription={makeSub({ payment_channel: 'Visa' })}
        onClick={vi.fn()}
        onDelete={vi.fn()}
        isDeleteOpen={false}
        onDeleteOpenChange={vi.fn()}
        onReorderStart={vi.fn()}
        onReorderMove={vi.fn()}
        onReorderEnd={vi.fn()}
        isDragging={false}
      />
    )
    expect(screen.getByText('Visa')).toBeInTheDocument()
  })

  it('does not render payment channel when null', () => {
    render(
      <SubscriptionRow
        subscription={makeSub({ payment_channel: null })}
        onClick={vi.fn()}
        onDelete={vi.fn()}
        isDeleteOpen={false}
        onDeleteOpenChange={vi.fn()}
        onReorderStart={vi.fn()}
        onReorderMove={vi.fn()}
        onReorderEnd={vi.fn()}
        isDragging={false}
      />
    )
    expect(screen.queryByText('Visa')).not.toBeInTheDocument()
  })

  it('renders amount', () => {
    render(
      <SubscriptionRow
        subscription={makeSub({ amount: 10, cycle: 'monthly' })}
        onClick={vi.fn()}
        onDelete={vi.fn()}
        isDeleteOpen={false}
        onDeleteOpenChange={vi.fn()}
        onReorderStart={vi.fn()}
        onReorderMove={vi.fn()}
        onReorderEnd={vi.fn()}
        isDragging={false}
      />
    )
    expect(screen.getByText('$10')).toBeInTheDocument()
  })

  it('renders yearly subscription amount directly', () => {
    render(
      <SubscriptionRow
        subscription={makeSub({ amount: 120, cycle: 'yearly' })}
        onClick={vi.fn()}
        onDelete={vi.fn()}
        isDeleteOpen={false}
        onDeleteOpenChange={vi.fn()}
        onReorderStart={vi.fn()}
        onReorderMove={vi.fn()}
        onReorderEnd={vi.fn()}
        isDragging={false}
      />
    )
    expect(screen.getByText('$120')).toBeInTheDocument()
  })

  it('renders weekly subscription amount', () => {
    render(
      <SubscriptionRow
        subscription={makeSub({ amount: 5, cycle: 'weekly' })}
        onClick={vi.fn()}
        onDelete={vi.fn()}
        isDeleteOpen={false}
        onDeleteOpenChange={vi.fn()}
        onReorderStart={vi.fn()}
        onReorderMove={vi.fn()}
        onReorderEnd={vi.fn()}
        isDragging={false}
      />
    )
    expect(screen.getByText('$5')).toBeInTheDocument()
  })

  it('renders countdown and medium date', () => {
    render(
      <SubscriptionRow
        subscription={makeSub({ next_billing: '2026-03-29' })}
        onClick={vi.fn()}
        onDelete={vi.fn()}
        isDeleteOpen={false}
        onDeleteOpenChange={vi.fn()}
        onReorderStart={vi.fn()}
        onReorderMove={vi.fn()}
        onReorderEnd={vi.fn()}
        isDragging={false}
      />
    )
    // New format: "6d · Mar 29"
    expect(screen.getByText(/6d/)).toBeInTheDocument()
    expect(screen.getByText(/Mar 29/)).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(
      <SubscriptionRow
        subscription={makeSub()}
        onClick={onClick}
        onDelete={vi.fn()}
        isDeleteOpen={false}
        onDeleteOpenChange={vi.fn()}
        onReorderStart={vi.fn()}
        onReorderMove={vi.fn()}
        onReorderEnd={vi.fn()}
        isDragging={false}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'GitHub' }))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
