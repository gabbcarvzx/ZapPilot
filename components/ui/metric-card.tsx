import React, { type ReactNode } from "react";

import { PremiumCard } from "@/components/ui/premium-card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  description,
  icon,
  className
}: {
  label: string;
  value: ReactNode;
  description: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <PremiumCard className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
        </div>
        {icon ? <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">{icon}</div> : null}
      </div>
      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </PremiumCard>
  );
}
