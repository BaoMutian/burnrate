import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockExecute, mockSelect, mockLoad } = vi.hoisted(() => {
  const execute = vi.fn().mockResolvedValue(undefined)
  const select = vi.fn().mockResolvedValue([])
  const load = vi.fn().mockResolvedValue({
    execute,
    select,
  })

  return {
    mockExecute: execute,
    mockSelect: select,
    mockLoad: load,
  }
})

vi.mock('@tauri-apps/plugin-sql', () => ({
  default: {
    load: mockLoad,
  },
}))

import { deleteSubscription, getAllSubscriptions } from '../db'

describe('db', () => {
  beforeEach(() => {
    mockExecute.mockClear()
    mockSelect.mockClear()
    mockLoad.mockClear()
  })

  it('filters inactive subscriptions when loading all subscriptions', async () => {
    await getAllSubscriptions()

    expect(mockSelect).toHaveBeenCalledWith(
      expect.stringContaining('WHERE is_active = 1')
    )
  })

  it('soft deletes subscriptions by marking them inactive', async () => {
    await deleteSubscription('sub-1')

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining('SET is_active = 0'),
      ['sub-1']
    )
  })
})
