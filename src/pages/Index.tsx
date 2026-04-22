import { useMemo, useState } from "react";
import { Boxes, Layers, PackageSearch, Store, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CsvUploader } from "@/components/CsvUploader";
import { StatCard } from "@/components/StatCard";
import { StockByStore } from "@/components/views/StockByStore";
import { ProductSearch } from "@/components/views/ProductSearch";
import { CategoryAggregates } from "@/components/views/CategoryAggregates";
import { useStockData } from "@/hooks/useStockData";
import { clearAll } from "@/lib/stockDb";
import { fmtInt } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { rows, loading, refresh } = useStockData();
  const [tab, setTab] = useState("stores");
  const { toast } = useToast();

  const stats = useMemo(() => {
    const stores = new Set<string>();
    const products = new Set<string>();
    let qty = 0;
    for (const r of rows) {
      stores.add(r.storeCode);
      products.add(r.barcode);
      qty += r.stockQty;
    }
    return { stores: stores.size, products: products.size, qty };
  }, [rows]);

  const handleClear = async () => {
    await clearAll();
    await refresh();
    toast({ title: "Data cleared", description: "All uploaded rows removed." });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b border-border/60 bg-card/70 backdrop-blur">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-card">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Stock Portal</h1>
              <p className="text-xs text-muted-foreground">Multi-store inventory overview</p>
            </div>
          </div>
          {rows.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Trash2 className="mr-2 h-4 w-4" /> Clear data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all uploaded data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes all {fmtInt(rows.length)} rows from your local database. You can re-upload at any time.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClear}>Clear</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </header>

      <main className="container space-y-6 py-8">
        <CsvUploader onUploaded={refresh} />

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label="Stores" value={fmtInt(stats.stores)} icon={Store} />
          <StatCard label="Products (SKUs)" value={fmtInt(stats.products)} icon={PackageSearch} />
          <StatCard label="Stock units" value={fmtInt(stats.qty)} hint={`${fmtInt(rows.length)} rows`} icon={Layers} />
        </section>

        {loading ? (
          <div className="rounded-xl border border-border/60 bg-card p-10 text-center text-muted-foreground shadow-card">
            Loading…
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/60 p-12 text-center">
            <h2 className="mb-2 text-lg font-semibold">No data yet</h2>
            <p className="text-sm text-muted-foreground">
              Upload a stock CSV above to start exploring inventory across your stores.
            </p>
          </div>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full max-w-xl grid-cols-3">
              <TabsTrigger value="stores">Stock by store</TabsTrigger>
              <TabsTrigger value="search">Product search</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            <TabsContent value="stores" className="mt-4"><StockByStore rows={rows} /></TabsContent>
            <TabsContent value="search" className="mt-4"><ProductSearch rows={rows} /></TabsContent>
            <TabsContent value="categories" className="mt-4"><CategoryAggregates rows={rows} /></TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Index;
