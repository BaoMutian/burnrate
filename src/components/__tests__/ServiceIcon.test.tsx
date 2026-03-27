import { describe, it, expect, vi } from 'vitest'

// Unmock ServiceIcon for this specific test file
vi.unmock('../ServiceIcon')
// Provide a proper mock for @lobehub/icons that doesn't throw on unknown access
vi.mock('@lobehub/icons', () => new Proxy({}, { get: () => undefined }))

import { render, screen } from '@testing-library/react'
import ServiceIcon from '../ServiceIcon'

describe('ServiceIcon', () => {
  it('renders monogram fallback when iconKey is null', () => {
    render(<ServiceIcon iconKey={null} name="Netflix" />)
    expect(screen.getByText('N')).toBeInTheDocument()
  })

  it('uses first character uppercase for monogram', () => {
    render(<ServiceIcon iconKey={null} name="spotify" />)
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  it('generates consistent colors for same name', () => {
    const { container: c1 } = render(<ServiceIcon iconKey={null} name="TestService" />)
    const { container: c2 } = render(<ServiceIcon iconKey={null} name="TestService" />)

    const div1 = c1.querySelector('div[style]')
    const div2 = c2.querySelector('div[style]')
    expect(div1?.getAttribute('style')).toBe(div2?.getAttribute('style'))
  })

  it('generates different colors for different names', () => {
    const { container: c1 } = render(<ServiceIcon iconKey={null} name="ServiceA" />)
    const { container: c2 } = render(<ServiceIcon iconKey={null} name="ServiceB" />)

    const div1 = c1.querySelector('div[style]')
    const div2 = c2.querySelector('div[style]')
    expect(div1?.getAttribute('style')).not.toBe(div2?.getAttribute('style'))
  })
})
