import { integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const todos = sqliteTable('todos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export type Todo = typeof todos.$inferSelect
export type TodoInsert = typeof todos.$inferInsert

/** Stock snapshot rows (D1 / SQLite), aligned with CSV import / client `StockRow` shape. */
export const stockRows = sqliteTable(
  'stock_rows',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    periodFrom: text('period_from').notNull(),
    periodTo: text('period_to').notNull(),
    storeCode: text('store_code').notNull(),
    storeName: text('store_name').notNull().default(''),
    groupCode: text('group_code').notNull().default(''),
    groupName: text('group_name').notNull().default(''),
    divCode: text('div_code').notNull().default(''),
    divName: text('div_name').notNull().default(''),
    dptCode: text('dpt_code').notNull().default(''),
    dptName: text('dpt_name').notNull().default(''),
    lineCode: text('line_code').notNull().default(''),
    lineName: text('line_name').notNull().default(''),
    classCode: text('class_code').notNull().default(''),
    className: text('class_name').notNull().default(''),
    barcode: text('barcode').notNull(),
    productName: text('product_name').notNull().default(''),
    productNameJa: text('product_name_ja').notNull().default(''),
    stockQty: real('stock_qty').notNull().default(0),
    uploadedAt: integer('uploaded_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex('stock_rows_period_store_barcode_uidx').on(
      t.periodFrom,
      t.periodTo,
      t.storeCode,
      t.barcode,
    ),
  ],
)

/** Row as stored in D1 (Drizzle-inferred). */
export type StockRowSelect = typeof stockRows.$inferSelect
export type StockRowInsert = typeof stockRows.$inferInsert

/**
 * Client / IndexedDB / CSV-mapped row: composite key string and epoch ms for `uploadedAt`
 * (Drizzle select shape otherwise).
 */
export type StockRow = Omit<StockRowSelect, 'id' | 'uploadedAt'> & {
  id: string
  uploadedAt: number
}
