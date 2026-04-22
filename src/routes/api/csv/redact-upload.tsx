import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-router/ssr/client'
import Papa from 'papaparse'
import { sql } from 'drizzle-orm'

import { db } from '#/db/index'
import { stockRows } from '#/db/schema'
import { insertStockRowSchema } from '#/db/schema.zod'
import { mapCsvRow, type StockRow } from '#/lib/stockDb'
import { redactStockCsvWithPython } from '#/server/redactStockCsv'

function stockRowToInsert(row: StockRow) {
  return {
    periodFrom: row.periodFrom,
    periodTo: row.periodTo,
    storeCode: row.storeCode,
    storeName: row.storeName,
    groupCode: row.groupCode,
    groupName: row.groupName,
    divCode: row.divCode,
    divName: row.divName,
    dptCode: row.dptCode,
    dptName: row.dptName,
    lineCode: row.lineCode,
    lineName: row.lineName,
    classCode: row.classCode,
    className: row.className,
    barcode: row.barcode,
    productName: row.productName,
    productNameJa: row.productNameJa,
    stockQty: row.stockQty,
    stockCost: row.stockCost,
    uploadedAt: new Date(row.uploadedAt),
  }
}

async function upsertStockRows(rows: ReturnType<typeof stockRowToInsert>[]) {
  if (!rows.length) return 0
  const CHUNK = 500
  let n = 0
  for (let i = 0; i < rows.length; i += CHUNK) {
    const batch = rows.slice(i, i + CHUNK)
    await db
      .insert(stockRows)
      .values(batch)
      .onConflictDoUpdate({
        target: [
          stockRows.periodFrom,
          stockRows.periodTo,
          stockRows.storeCode,
          stockRows.barcode,
        ],
        set: {
          storeName: sql`excluded.store_name`,
          groupCode: sql`excluded.group_code`,
          groupName: sql`excluded.group_name`,
          divCode: sql`excluded.div_code`,
          divName: sql`excluded.div_name`,
          dptCode: sql`excluded.dpt_code`,
          dptName: sql`excluded.dpt_name`,
          lineCode: sql`excluded.line_code`,
          lineName: sql`excluded.line_name`,
          classCode: sql`excluded.class_code`,
          className: sql`excluded.class_name`,
          productName: sql`excluded.product_name`,
          productNameJa: sql`excluded.product_name_ja`,
          stockQty: sql`excluded.stock_qty`,
          stockCost: sql`excluded.stock_cost`,
          uploadedAt: sql`excluded.uploaded_at`,
        },
      })
    n += batch.length
  }
  return n
}

export const Route = createFileRoute('/api/csv/redact-upload')({
  component: () => null,
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ct = request.headers.get('content-type') || ''
        if (!ct.includes('multipart/form-data')) {
          return json({ error: 'Expected multipart/form-data with a file field.' }, { status: 415 })
        }

        let form: FormData
        try {
          form = await request.formData()
        } catch {
          return json({ error: 'Invalid form data.' }, { status: 400 })
        }

        const file = form.get('file')
        if (!(file instanceof File)) {
          return json({ error: 'Missing file field.' }, { status: 400 })
        }

        const rawText = await file.text()
        const redacted = redactStockCsvWithPython(rawText)
        if (!redacted.ok) {
          return json(
            { error: 'Redaction script failed.', detail: redacted.error },
            { status: 500 },
          )
        }

        const parsed = Papa.parse<Record<string, unknown>>(redacted.csv, {
          header: true,
          skipEmptyLines: true,
        })
        if (parsed.errors.length) {
          return json(
            {
              error: 'CSV parse error after redaction.',
              detail: parsed.errors.map((e) => e.message).join('; '),
            },
            { status: 400 },
          )
        }

        const mapped: ReturnType<typeof stockRowToInsert>[] = []
        for (const r of parsed.data) {
          const row = mapCsvRow(r)
          if (!row) continue
          const insert = stockRowToInsert(row)
          const check = insertStockRowSchema.safeParse(insert)
          if (!check.success) continue
          mapped.push(insert)
        }

        if (!mapped.length) {
          return json(
            {
              error: 'No valid stock rows after redaction.',
              rowsParsed: parsed.data.length,
              rowsUpserted: 0,
            },
            { status: 422 },
          )
        }

        const rowsUpserted = await upsertStockRows(mapped)

        return json({
          ok: true,
          rowsParsed: parsed.data.length,
          rowsUpserted,
        })
      },
    },
  },
})
