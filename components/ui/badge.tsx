import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800 ring-1 ring-inset ring-violet-200/70",
        className
      )}
    >
      {children}
    </span>
  );
}
