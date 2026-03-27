import Database from '@tauri-apps/plugin-sql'
import type { Subscription, ExchangeRate } from '../types'

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
      amount          REAL NOT NULL,
      currency        TEXT NOT NULL DEFAULT 'USD',
      cycle           TEXT NOT NULL DEFAULT 'monthly',
      tier            TEXT,
      next_billing    TEXT NOT NULL,
      payment_channel TEXT,
      is_active       INTEGER NOT NULL DEFAULT 1,
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

  // Default settings
  await database.execute(`INSERT OR IGNORE INTO settings (key, value) VALUES ('display_currency', 'USD')`)
  await database.execute(`INSERT OR IGNORE INTO settings (key, value) VALUES ('language', 'en')`)
  await database.execute(`INSERT OR IGNORE INTO settings (key, value) VALUES ('sort_by', 'next_billing')`)
}

// Subscriptions CRUD
export async function getAllSubscriptions(): Promise<Subscription[]> {
  const database = await getDb()
  return await database.select<Subscription[]>('SELECT * FROM subscriptions WHERE is_active = 1')
}

export async function addSubscription(sub: Omit<Subscription, 'id' | 'is_active' | 'created_at' | 'updated_at'>): Promise<void> {
  const database = await getDb()
  await database.execute(
    `INSERT INTO subscriptions (name, icon_key, amount, currency, cycle, tier, next_billing, payment_channel)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [sub.name, sub.icon_key, sub.amount, sub.currency, sub.cycle, sub.tier, sub.next_billing, sub.payment_channel]
  )
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
  await database.execute('DELETE FROM subscriptions WHERE id = $1', [id])
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
