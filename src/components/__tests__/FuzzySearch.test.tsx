import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FuzzySearch from '../FuzzySearch'
import '../../i18n'

describe('FuzzySearch', () => {
  it('renders search input', () => {
    render(<FuzzySearch onSelect={vi.fn()} onCustom={vi.fn()} />)
    expect(screen.getByPlaceholderText('Search services...')).toBeInTheDocument()
  })

  it('shows default presets when query is empty', () => {
    render(<FuzzySearch onSelect={vi.fn()} onCustom={vi.fn()} />)
    expect(screen.getByText('ChatGPT')).toBeInTheDocument()
  })

  it('filters results by typing', async () => {
    const user = userEvent.setup()
    render(<FuzzySearch onSelect={vi.fn()} onCustom={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('Search services...'), 'figma')
    expect(screen.getByText('Figma')).toBeInTheDocument()
  })

  it('shows custom service option when typing', async () => {
    const user = userEvent.setup()
    render(<FuzzySearch onSelect={vi.fn()} onCustom={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('Search services...'), 'custom')
    expect(screen.getByText(/Add custom service/)).toBeInTheDocument()
  })

  it('does not show custom option when query is empty', () => {
    render(<FuzzySearch onSelect={vi.fn()} onCustom={vi.fn()} />)
    expect(screen.queryByText(/Add custom service/)).not.toBeInTheDocument()
  })

  it('calls onSelect when a preset is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<FuzzySearch onSelect={onSelect} onCustom={vi.fn()} />)

    await user.click(screen.getByText('ChatGPT'))
    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ChatGPT', defaultAmount: 20 })
    )
  })

  it('calls onCustom when custom service is clicked', async () => {
    const user = userEvent.setup()
    const onCustom = vi.fn()
    render(<FuzzySearch onSelect={vi.fn()} onCustom={onCustom} />)

    await user.type(screen.getByPlaceholderText('Search services...'), 'MyTool')
    await user.click(screen.getByText(/Add custom service/))
    expect(onCustom).toHaveBeenCalledWith('MyTool')
  })

  it('shows prices for presets', () => {
    render(<FuzzySearch onSelect={vi.fn()} onCustom={vi.fn()} />)
    // Multiple presets may share the same price
    const priceElements = screen.getAllByText('$20')
    expect(priceElements.length).toBeGreaterThan(0)
  })

  it('shows formatted currency for CNY presets', async () => {
    const user = userEvent.setup()
    render(<FuzzySearch onSelect={vi.fn()} onCustom={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('Search services...'), '腾讯')
    // Intl.NumberFormat formats CNY with the locale-appropriate symbol
    expect(screen.getByText(/¥100/)).toBeInTheDocument()
  })

  it('auto-focuses the search input', () => {
    render(<FuzzySearch onSelect={vi.fn()} onCustom={vi.fn()} />)
    expect(screen.getByPlaceholderText('Search services...')).toHaveFocus()
  })

  it('shows all presets when query is empty', () => {
    render(<FuzzySearch onSelect={vi.fn()} onCustom={vi.fn()} />)
    const buttons = screen.getAllByRole('button')
    // Should show all presets (no artificial limit)
    expect(buttons.length).toBeGreaterThan(10)
  })
})
