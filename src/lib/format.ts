export const fmtInt = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n || 0);

export const fmtMoney = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "HKD", maximumFractionDigits: 0 }).format(n || 0);

export const fmtPct = (n: number) =>
  `${(n * 100).toFixed(1)}%`;
