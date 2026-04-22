import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtInt } from "@/lib/format";
import type { StockRow } from "@/lib/stockDb";

interface Props { rows: StockRow[]; }

interface ProductHit {
  barcode: string;
  productName: string;
  productNameJa: string;
  totalQty: number;
  byStore: { storeCode: string; storeName: string; qty: number }[];
}

export const ProductSearch = ({ rows }: Props) => {
  const [query, setQuery] = useState("");

  const hits = useMemo<ProductHit[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const products = new Map<string, ProductHit>();
    for (const r of rows) {
      const match =
        r.barcode.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.productNameJa.toLowerCase().includes(q);
      if (!match) continue;
      let p = products.get(r.barcode);
      if (!p) {
        p = {
          barcode: r.barcode,
          productName: r.productName,
          productNameJa: r.productNameJa,
          totalQty: 0,
          byStore: [],
        };
        products.set(r.barcode, p);
      }
      p.totalQty += r.stockQty;
      const existing = p.byStore.find((s) => s.storeCode === r.storeCode);
      if (existing) {
        existing.qty += r.stockQty;
      } else {
        p.byStore.push({ storeCode: r.storeCode, storeName: r.storeName, qty: r.stockQty });
      }
    }
    return Array.from(products.values())
      .sort((a, b) => a.barcode.localeCompare(b.barcode) || a.productName.localeCompare(b.productName))
      .slice(0, 50);
  }, [rows, query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by barcode, Chinese or Japanese product name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-11 text-base"
        />
      </div>

      {!query.trim() && (
        <Card className="border-dashed bg-card/50 p-10 text-center text-muted-foreground">
          Start typing to search across {fmtInt(rows.length)} stock rows.
        </Card>
      )}

      <div className="space-y-3">
        {hits.map((p) => (
          <Card key={p.barcode} className="overflow-hidden border-border/60 shadow-card">
            <div className="flex flex-col gap-2 border-b bg-gradient-subtle px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono">{p.barcode}</Badge>
                  <h3 className="font-semibold">{p.productName || "—"}</h3>
                </div>
                {p.productNameJa && p.productNameJa !== p.productName && (
                  <p className="mt-1 text-sm text-muted-foreground">{p.productNameJa}</p>
                )}
              </div>
              <div className="flex gap-4 text-sm">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total qty</p>
                  <p className="font-semibold tabular-nums">{fmtInt(p.totalQty)}</p>
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {p.byStore
                  .slice()
                  .sort((a, b) => a.storeCode.localeCompare(b.storeCode))
                  .map((s) => (
                    <TableRow key={s.storeCode}>
                      <TableCell><Badge variant="outline">{s.storeCode}</Badge> <span className="text-muted-foreground">{s.storeName}</span></TableCell>
                      <TableCell className="text-right tabular-nums">{fmtInt(s.qty)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        ))}

        {query.trim() && hits.length === 0 && (
          <Card className="border-dashed p-10 text-center text-muted-foreground">No products match "{query}".</Card>
        )}
      </div>
    </div>
  );
};
