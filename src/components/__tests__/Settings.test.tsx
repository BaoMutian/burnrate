import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Settings from '../Settings'
import type { Settings as SettingsType } from '../../types'
import '../../i18n'

const defaultSettings: SettingsType = {
  display_currency: 'USD',
  language: 'en',
  sort_by: 'next_billing',
}

describe('Settings', () => {
  it('renders title and back button', () => {
    render(<Settings settings={defaultSettings} onUpdate={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Back')).toBeInTheDocument()
  })

  it('calls onBack when Back is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<Settings settings={defaultSettings} onUpdate={onBack} onBack={onBack} />)

    await user.click(screen.getByText('Back'))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('shows current currency selection', () => {
    render(<Settings settings={defaultSettings} onUpdate={vi.fn()} onBack={vi.fn()} />)
    const select = screen.getByDisplayValue('USD')
    expect(select).toBeInTheDocument()
  })

  it('calls onUpdate when currency is changed', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<Settings settings={defaultSettings} onUpdate={onUpdate} onBack={vi.fn()} />)

    await user.selectOptions(screen.getByDisplayValue('USD'), 'EUR')
    expect(onUpdate).toHaveBeenCalledWith('display_currency', 'EUR')
  })

  it('renders language toggle with English and Chinese', () => {
    render(<Settings settings={defaultSettings} onUpdate={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('中文')).toBeInTheDocument()
  })

  it('calls onUpdate when language is changed', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<Settings settings={defaultSettings} onUpdate={onUpdate} onBack={vi.fn()} />)

    await user.click(screen.getByText('中文'))
    expect(onUpdate).toHaveBeenCalledWith('language', 'zh')
  })

  it('renders sort options', () => {
    render(<Settings settings={defaultSettings} onUpdate={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText('Manual')).toBeInTheDocument()
    expect(screen.getByText('By date')).toBeInTheDocument()
    expect(screen.getByText('By amount')).toBeInTheDocument()
  })

  it('calls onUpdate when sort is changed', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<Settings settings={defaultSettings} onUpdate={onUpdate} onBack={vi.fn()} />)

    await user.click(screen.getByText('By amount'))
    expect(onUpdate).toHaveBeenCalledWith('sort_by', 'amount')
  })

  it('has all expected currency options', () => {
    render(<Settings settings={defaultSettings} onUpdate={vi.fn()} onBack={vi.fn()} />)
    const currencies = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'CAD', 'AUD', 'KRW', 'HKD', 'TWD']
    const select = screen.getByDisplayValue('USD')
    const options = Array.from((select as HTMLSelectElement).options).map((o) => o.value)
    for (const c of currencies) {
      expect(options).toContain(c)
    }
  })
})
