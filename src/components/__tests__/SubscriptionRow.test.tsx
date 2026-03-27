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
    render(<SubscriptionRow subscription={makeSub()} onClick={vi.fn()} />)
    expect(screen.getByText('GitHub')).toBeInTheDocument()
  })

  it('renders payment channel', () => {
    render(<SubscriptionRow subscription={makeSub({ payment_channel: 'Visa' })} onClick={vi.fn()} />)
    expect(screen.getByText('Visa')).toBeInTheDocument()
  })

  it('does not render payment channel when null', () => {
    render(<SubscriptionRow subscription={makeSub({ payment_channel: null })} onClick={vi.fn()} />)
    expect(screen.queryByText('Visa')).not.toBeInTheDocument()
  })

  it('renders monthly amount with /mo', () => {
    render(<SubscriptionRow subscription={makeSub({ amount: 10, cycle: 'monthly' })} onClick={vi.fn()} />)
    expect(screen.getByText('$10')).toBeInTheDocument()
    expect(screen.getByText('/mo')).toBeInTheDocument()
  })

  it('renders yearly subscription with ≈ monthly equivalent and original /yr amount', () => {
    const { container } = render(
      <SubscriptionRow subscription={makeSub({ amount: 120, cycle: 'yearly' })} onClick={vi.fn()} />
    )
    // Check the button text content contains both values
    const button = container.querySelector('button')!
    expect(button.textContent).toContain('≈')
    expect(button.textContent).toContain('$10')
    expect(button.textContent).toContain('$120/yr')
  })

  it('renders weekly amount with /wk', () => {
    render(<SubscriptionRow subscription={makeSub({ amount: 5, cycle: 'weekly' })} onClick={vi.fn()} />)
    expect(screen.getByText('$5')).toBeInTheDocument()
    expect(screen.getByText('/wk')).toBeInTheDocument()
  })

  it('renders relative countdown and due date', () => {
    render(<SubscriptionRow subscription={makeSub({ next_billing: '2026-03-29' })} onClick={vi.fn()} />)
    expect(screen.getByText('6d')).toBeInTheDocument()
    expect(screen.getByText('3/29 due')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<SubscriptionRow subscription={makeSub()} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
