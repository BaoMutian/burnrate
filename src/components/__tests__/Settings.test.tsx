import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Settings from '../Settings'
import type { Settings as SettingsType } from '../../types'
import '../../i18n'

const defaultSettings: SettingsType = {
  display_currency: 'CNY',
  language: 'en',
  sort_by: 'next_billing',
  tray_display: 'monthly',
}

describe('Settings', () => {
  it('renders title and back button', () => {
    render(<Settings settings={defaultSettings} onUpdate={vi.fn()} onBack={vi.fn()} onClearData={vi.fn()} />)
    expect(screen.getAllByText('Settings')[0]).toBeInTheDocument()
    expect(screen.getByLabelText('Back')).toBeInTheDocument()
  })

  it('calls onBack when Back is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<Settings settings={defaultSettings} onUpdate={onBack} onBack={onBack} onClearData={vi.fn()} />)

    await user.click(screen.getByLabelText('Back'))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('shows current currency selection', () => {
    render(<Settings settings={defaultSettings} onUpdate={vi.fn()} onBack={vi.fn()} onClearData={vi.fn()} />)
    const select = screen.getByDisplayValue(/CNY|人民币/)
    expect(select).toBeInTheDocument()
  })

  it('calls onUpdate when currency is changed', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<Settings settings={defaultSettings} onUpdate={onUpdate} onBack={vi.fn()} onClearData={vi.fn()} />)

    await user.selectOptions(screen.getByDisplayValue(/CNY|人民币/), 'EUR')
    expect(onUpdate).toHaveBeenCalledWith('display_currency', 'EUR')
  })

  it('renders language toggle with English and Chinese', () => {
    render(<Settings settings={defaultSettings} onUpdate={vi.fn()} onBack={vi.fn()} onClearData={vi.fn()} />)
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('中文')).toBeInTheDocument()
  })

  it('calls onUpdate when language is changed', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<Settings settings={defaultSettings} onUpdate={onUpdate} onBack={vi.fn()} onClearData={vi.fn()} />)

    await user.click(screen.getByText('中文'))
    expect(onUpdate).toHaveBeenCalledWith('language', 'zh')
  })

  it('renders tray display options', () => {
    render(<Settings settings={defaultSettings} onUpdate={vi.fn()} onBack={vi.fn()} onClearData={vi.fn()} />)
    expect(screen.getByText('Monthly')).toBeInTheDocument()
    expect(screen.getByText('Daily')).toBeInTheDocument()
  })

  it('calls onUpdate when tray display is changed', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    render(<Settings settings={defaultSettings} onUpdate={onUpdate} onBack={vi.fn()} onClearData={vi.fn()} />)

    await user.click(screen.getByText('Daily'))
    expect(onUpdate).toHaveBeenCalledWith('tray_display', 'daily')
  })

  it('has all expected currency options', () => {
    render(<Settings settings={defaultSettings} onUpdate={vi.fn()} onBack={vi.fn()} onClearData={vi.fn()} />)
    const currencies = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'CAD', 'AUD', 'KRW', 'HKD']
    const select = screen.getByDisplayValue(/CNY|人民币/)
    const options = Array.from((select as HTMLSelectElement).options).map((o) => o.value)
    for (const c of currencies) {
      expect(options).toContain(c)
    }
  })
})
