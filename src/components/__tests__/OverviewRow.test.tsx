import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import OverviewRow from '../OverviewRow'
import '../../i18n'

describe('OverviewRow', () => {
  it('renders monthly total', () => {
    render(<OverviewRow monthlyTotal={117} yearlyTotal={1404} activeCount={12} currency="USD" />)
    expect(screen.getByText('$117')).toBeInTheDocument()
  })

  it('renders yearly total', () => {
    render(<OverviewRow monthlyTotal={117} yearlyTotal={1404} activeCount={12} currency="USD" />)
    expect(screen.getByText('$1,404')).toBeInTheDocument()
  })

  it('renders active count', () => {
    render(<OverviewRow monthlyTotal={117} yearlyTotal={1404} activeCount={12} currency="USD" />)
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('renders cycle labels', () => {
    render(<OverviewRow monthlyTotal={1} yearlyTotal={2} activeCount={0} currency="USD" />)
    expect(screen.getByText('/mo')).toBeInTheDocument()
    expect(screen.getByText('this yr')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('handles zero values', () => {
    render(<OverviewRow monthlyTotal={0} yearlyTotal={0} activeCount={0} currency="USD" />)
    // Both monthly and yearly show $0, so use getAllByText
    const zeros = screen.getAllByText('$0')
    expect(zeros).toHaveLength(2)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('formats fractional amounts', () => {
    render(<OverviewRow monthlyTotal={10.99} yearlyTotal={131.88} activeCount={1} currency="USD" />)
    expect(screen.getByText('$10.99')).toBeInTheDocument()
    expect(screen.getByText('$131.88')).toBeInTheDocument()
  })
})
