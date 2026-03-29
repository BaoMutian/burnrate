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

vi.mock('@tauri-apps/plugin-dialog', () => ({
  save: vi.fn(),
  open: vi.fn(),
}))

vi.mock('@tauri-apps/plugin-fs', () => ({
  writeTextFile: vi.fn(),
  readTextFile: vi.fn(),
}))

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue(undefined),
}))

import { deleteSubscription, getAllSubscriptions } from '../db'

describe('db', () => {
  beforeEach(() => {
    mockExecute.mockClear()
    mockSelect.mockClear()
    mockLoad.mockClear()
  })

  it('loads all subscriptions ordered by sort_order', async () => {
    await getAllSubscriptions()

    expect(mockSelect).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY sort_order ASC')
    )
  })

  it('hard deletes subscription and its topups', async () => {
    await deleteSubscription('sub-1')

    expect(mockExecute).toHaveBeenCalledWith(
      'DELETE FROM topups WHERE subscription_id = $1',
      ['sub-1']
    )
    expect(mockExecute).toHaveBeenCalledWith(
      'DELETE FROM subscriptions WHERE id = $1',
      ['sub-1']
    )
  })
})
