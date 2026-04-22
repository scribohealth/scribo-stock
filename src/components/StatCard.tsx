import { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Props {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}

export const StatCard = forwardRef<HTMLDivElement, Props>(
  ({ label, value, hint, icon: Icon }, ref) => (
    <Card ref={ref} className="relative overflow-hidden border-border/60 bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 truncate text-2xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-card">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
);
StatCard.displayName = "StatCard";
