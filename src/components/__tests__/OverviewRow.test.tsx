import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import OverviewRow from '../OverviewRow'
import '../../i18n'

describe('OverviewRow', () => {
  const defaults = {
    monthlyTotal: 117,
    cumulativeTotal: 1404,
    dailyAverage: 3.84,
    activeCount: 12,
    currency: 'USD',
  }

  it('renders monthly total as hero', () => {
    render(<OverviewRow {...defaults} />)
    expect(screen.getByText('$117')).toBeInTheDocument()
    expect(screen.getByText('/mo')).toBeInTheDocument()
  })

  it('renders cumulative total', () => {
    render(<OverviewRow {...defaults} />)
    expect(screen.getByText('$1,404')).toBeInTheDocument()
    expect(screen.getByText('total')).toBeInTheDocument()
  })

  it('renders daily average', () => {
    render(<OverviewRow {...defaults} />)
    expect(screen.getByText('$3.84')).toBeInTheDocument()
    expect(screen.getByText('/day')).toBeInTheDocument()
  })

  it('renders active count', () => {
    render(<OverviewRow {...defaults} />)
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('handles zero values', () => {
    render(<OverviewRow monthlyTotal={0} cumulativeTotal={0} dailyAverage={0} activeCount={0} currency="USD" />)
    const zeros = screen.getAllByText('$0')
    expect(zeros).toHaveLength(3) // monthly, cumulative, daily
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
