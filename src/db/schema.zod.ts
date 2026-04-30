import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

import { stockRows, todos } from './schema.ts'

export const insertTodoSchema = createInsertSchema(todos)
export const selectTodoSchema = createSelectSchema(todos)

export const insertStockRowSchema = createInsertSchema(stockRows)
export const selectStockRowSchema = createSelectSchema(stockRows)
