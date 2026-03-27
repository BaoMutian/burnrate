import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Footer from '../Footer'
import '../../i18n'

describe('Footer', () => {
  it('renders keyboard shortcut and dashboard link', () => {
    render(<Footer onAdd={vi.fn()} onSettings={vi.fn()} />)
    expect(screen.getByText('⌘')).toBeInTheDocument()
    expect(screen.getByText('N')).toBeInTheDocument()
    expect(screen.getByText(/Open Dashboard/)).toBeInTheDocument()
  })

  it('calls onAdd when shortcut area is clicked', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<Footer onAdd={onAdd} onSettings={vi.fn()} />)

    await user.click(screen.getByText('⌘'))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('calls onSettings when dashboard link is clicked', async () => {
    const user = userEvent.setup()
    const onSettings = vi.fn()
    render(<Footer onAdd={vi.fn()} onSettings={onSettings} />)

    await user.click(screen.getByText(/Open Dashboard/))
    expect(onSettings).toHaveBeenCalledOnce()
  })
})
