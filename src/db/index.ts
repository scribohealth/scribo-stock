import { drizzle } from 'drizzle-orm/d1'
import type { D1Database } from '@cloudflare/workers-types'
import { env } from 'cloudflare:workers'

import * as schema from './schema.ts'

export function getDb() {
  const d1 = (env as { DB: D1Database }).DB
  return drizzle(d1, { schema })
}

export type AppDb = ReturnType<typeof getDb>
