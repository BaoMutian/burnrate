import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { createElement } from 'react'

// Mock @tauri-apps/api/core
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

// Mock @tauri-apps/plugin-sql
vi.mock('@tauri-apps/plugin-sql', () => {
  const mockDb = {
    execute: vi.fn().mockResolvedValue(undefined),
    select: vi.fn().mockResolvedValue([]),
  }
  return {
    default: {
      load: vi.fn().mockResolvedValue(mockDb),
    },
  }
})

// Mock @lobehub/icons
vi.mock('@lobehub/icons', () => ({
  default: {},
}))

// Mock ServiceIcon globally — avoids async dynamic import issues
vi.mock('../components/ServiceIcon', () => ({
  default: ({ name }: { iconKey: string | null; name: string }) => {
    return createElement('div', { 'data-testid': 'service-icon' }, name.charAt(0).toUpperCase())
  },
}))
