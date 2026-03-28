import Database from '@tauri-apps/plugin-sql'
import type { Subscription, ExchangeRate, Topup } from '../types'
import { SETTING_DEFAULTS } from './defaults'

let db: Database | null = null

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load('sqlite:burnrate.db')
    await runMigrations(db)
  }
  return db
}

async function runMigrations(database: Database) {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name            TEXT NOT NULL,
      icon_key        TEXT,
      sort_order      INTEGER,
      amount          REAL NOT NULL,
      currency        TEXT NOT NULL DEFAULT 'USD',
      cycle           TEXT NOT NULL DEFAULT 'monthly',
      tier            TEXT,
      next_billing    TEXT NOT NULL,
      payment_channel TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  await database.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)

  await database.execute(`
    CREATE TABLE IF NOT EXISTS exchange_rates (
      from_currency TEXT NOT NULL,
      to_currency   TEXT NOT NULL,
      rate          REAL NOT NULL,
      updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (from_currency, to_currency)
    )
  `)

  // Migration: add tier column if missing
  await database.execute(`ALTER TABLE subscriptions ADD COLUMN tier TEXT`).catch(() => {})
  await database.execute(`ALTER TABLE subscriptions ADD COLUMN sort_order INTEGER`).catch(() => {})
  await database.execute(`ALTER TABLE subscriptions ADD COLUMN account TEXT`).catch(() => {})
  await database.execute(`ALTER TABLE subscriptions ADD COLUMN password TEXT`).catch(() => {})
  await database.execute(`ALTER TABLE subscriptions ADD COLUMN notes TEXT`).catch(() => {})
  await database.execute(`ALTER TABLE subscriptions ADD COLUMN is_pinned INTEGER NOT NULL DEFAULT 0`).catch(() => {})
  await database.execute(`ALTER TABLE subscriptions ADD COLUMN auto_renew INTEGER NOT NULL DEFAULT 1`).catch(() => {})
  await database.execute(`ALTER TABLE subscriptions ADD COLUMN billing_type TEXT NOT NULL DEFAULT 'recurring'`).catch(() => {})


  await database.execute(`
    CREATE TABLE IF NOT EXISTS topups (
      id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      subscription_id   TEXT NOT NULL,
      amount            REAL NOT NULL,
      currency          TEXT NOT NULL,
      note              TEXT,
      created_at        TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  const ordered = await database.select<Array<{ id: string; sort_order: number | null }>>(
    `SELECT id, sort_order
     FROM subscriptions
     ORDER BY
       CASE WHEN sort_order IS NULL THEN 1 ELSE 0 END,
       sort_order ASC,
       datetime(created_at) ASC,
       rowid ASC`
  )

  await Promise.all(
    ordered.map((row, index) => {
      const nextOrder = index + 1
      if (row.sort_order === nextOrder) return Promise.resolve()
      return database.execute(
        `UPDATE subscriptions SET sort_order = $1 WHERE id = $2`,
        [nextOrder, row.id]
      )
    })
  )

  await database.execute(`
    CREATE TABLE IF NOT EXISTS preset_favorites (
      name TEXT PRIMARY KEY
    )
  `)

  // Default settings
  for (const [key, value] of Object.entries(SETTING_DEFAULTS)) {
    await database.execute(`INSERT OR IGNORE INTO settings (key, value) VALUES ($1, $2)`, [key, value])
  }
}

// Subscriptions CRUD
export async function getAllSubscriptions(): Promise<Subscription[]> {
  const database = await getDb()
  return await database.select<Subscription[]>(
    `SELECT * FROM subscriptions
     ORDER BY sort_order ASC, datetime(created_at) ASC, id ASC`
  )
}

export async function addSubscription(sub: Omit<Subscription, 'id' | 'sort_order' | 'is_pinned' | 'created_at' | 'updated_at'>): Promise<string> {
  const database = await getDb()
  const id = crypto.randomUUID().replace(/-/g, '')
  await database.execute(
    `INSERT INTO subscriptions (id, name, icon_key, sort_order, amount, currency, cycle, tier, next_billing, payment_channel, account, password, notes, auto_renew, billing_type)
     VALUES ($1, $2, $3, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM subscriptions), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [id, sub.name, sub.icon_key, sub.amount, sub.currency, sub.cycle, sub.tier, sub.next_billing, sub.payment_channel, sub.account, sub.password, sub.notes, sub.auto_renew, sub.billing_type]
  )
  return id
}

export async function updateSubscription(id: string, sub: Partial<Subscription>): Promise<void> {
  const database = await getDb()
  const fields: string[] = []
  const values: unknown[] = []
  let idx = 1

  for (const [key, value] of Object.entries(sub)) {
    if (key === 'id' || key === 'created_at') continue
    fields.push(`${key} = $${idx}`)
    values.push(value)
    idx++
  }

  fields.push(`updated_at = datetime('now')`)
  values.push(id)

  await database.execute(
    `UPDATE subscriptions SET ${fields.join(', ')} WHERE id = $${idx}`,
    values
  )
}

export async function deleteSubscription(id: string): Promise<void> {
  const database = await getDb()
  await database.execute('DELETE FROM topups WHERE subscription_id = $1', [id])
  await database.execute('DELETE FROM subscriptions WHERE id = $1', [id])
}

export async function reorderSubscriptions(ids: string[]): Promise<void> {
  const database = await getDb()
  await Promise.all(
    ids.map((id, index) =>
      database.execute(
        `UPDATE subscriptions SET sort_order = $1, updated_at = datetime('now') WHERE id = $2`,
        [index + 1, id]
      )
    )
  )
}

// Settings
export async function getSetting(key: string): Promise<string | null> {
  const database = await getDb()
  const rows = await database.select<{ value: string }[]>(
    'SELECT value FROM settings WHERE key = $1',
    [key]
  )
  return rows.length > 0 ? rows[0].value : null
}

export async function setSetting(key: string, value: string): Promise<void> {
  const database = await getDb()
  await database.execute(
    'INSERT OR REPLACE INTO settings (key, value) VALUES ($1, $2)',
    [key, value]
  )
}

// Preset favorites
export async function getFavoritePresets(): Promise<string[]> {
  const database = await getDb()
  const rows = await database.select<{ name: string }[]>('SELECT name FROM preset_favorites')
  return rows.map(r => r.name)
}

export async function toggleFavoritePreset(name: string): Promise<void> {
  const database = await getDb()
  const rows = await database.select<{ name: string }[]>(
    'SELECT name FROM preset_favorites WHERE name = $1',
    [name]
  )
  if (rows.length > 0) {
    await database.execute('DELETE FROM preset_favorites WHERE name = $1', [name])
  } else {
    await database.execute('INSERT INTO preset_favorites (name) VALUES ($1)', [name])
  }
}

// Exchange rates
export async function getExchangeRate(from: string, to: string): Promise<number | null> {
  const database = await getDb()
  const rows = await database.select<ExchangeRate[]>(
    'SELECT * FROM exchange_rates WHERE from_currency = $1 AND to_currency = $2',
    [from, to]
  )
  return rows.length > 0 ? rows[0].rate : null
}

export async function setExchangeRate(from: string, to: string, rate: number): Promise<void> {
  const database = await getDb()
  await database.execute(
    `INSERT OR REPLACE INTO exchange_rates (from_currency, to_currency, rate, updated_at)
     VALUES ($1, $2, $3, datetime('now'))`,
    [from, to, rate]
  )
}

// Topups
export async function getTopups(subscriptionId: string): Promise<Topup[]> {
  const database = await getDb()
  return await database.select<Topup[]>(
    'SELECT * FROM topups WHERE subscription_id = $1 ORDER BY datetime(created_at) DESC',
    [subscriptionId]
  )
}

export async function addTopup(subscriptionId: string, amount: number, currency: string, note: string | null): Promise<void> {
  const database = await getDb()
  await database.execute(
    'INSERT INTO topups (subscription_id, amount, currency, note) VALUES ($1, $2, $3, $4)',
    [subscriptionId, amount, currency, note]
  )
}

export async function deleteTopup(id: string): Promise<void> {
  const database = await getDb()
  await database.execute('DELETE FROM topups WHERE id = $1', [id])
}

export async function getTopupTotals(): Promise<Map<string, number>> {
  const database = await getDb()
  const rows = await database.select<{ subscription_id: string; total: number }[]>(
    'SELECT subscription_id, SUM(amount) as total FROM topups GROUP BY subscription_id'
  )
  return new Map(rows.map(r => [r.subscription_id, r.total]))
}

export async function clearAllData(): Promise<void> {
  const database = await getDb()
  await database.execute('DELETE FROM topups')
  await database.execute('DELETE FROM subscriptions')
  await database.execute('DELETE FROM preset_favorites')
}
