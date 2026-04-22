import { useCallback, useEffect, useState } from "react";
import { getAllRows, type StockRow } from "@/lib/stockDb";

export function useStockData() {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const all = await getAllRows();
    setRows(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { rows, loading, refresh };
}
