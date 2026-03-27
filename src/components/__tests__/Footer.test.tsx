import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Footer from '../Footer'
import '../../i18n'

describe('Footer', () => {
  it('renders Add and Settings buttons', () => {
    render(<Footer onAdd={vi.fn()} onSettings={vi.fn()} />)
    expect(screen.getByText('Add')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders keyboard shortcuts', () => {
    render(<Footer onAdd={vi.fn()} onSettings={vi.fn()} />)
    expect(screen.getByText('⌘N')).toBeInTheDocument()
    expect(screen.getByText('⌘,')).toBeInTheDocument()
  })

  it('calls onAdd when Add is clicked', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<Footer onAdd={onAdd} onSettings={vi.fn()} />)

    await user.click(screen.getByText('Add'))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('calls onSettings when Settings is clicked', async () => {
    const user = userEvent.setup()
    const onSettings = vi.fn()
    render(<Footer onAdd={vi.fn()} onSettings={onSettings} />)

    await user.click(screen.getByText('Settings'))
    expect(onSettings).toHaveBeenCalledOnce()
  })
})
