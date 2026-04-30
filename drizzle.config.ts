import { defineConfig } from 'drizzle-kit'

/** Used by `drizzle-kit generate` only. Apply migrations with `wrangler d1 migrations apply`. */
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
})
