import React, { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatusTone = "success" | "warning" | "danger" | "neutral" | "brand";

const toneClassName: Record<StatusTone, string> = {
  success: "bg-emerald-100 text-emerald-800 ring-emerald-200/80",
  warning: "bg-amber-100 text-amber-800 ring-amber-200/80",
  danger: "bg-rose-100 text-rose-800 ring-rose-200/80",
  neutral: "bg-slate-100 text-slate-700 ring-slate-200/80",
  brand: "bg-violet-100 text-violet-800 ring-violet-200/80"
};

export function StatusBadge({
  tone = "neutral",
  children,
  className
}: {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
        toneClassName[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
