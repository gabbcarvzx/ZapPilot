import React, { type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PremiumCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function PremiumCard({ className, children, ...props }: PremiumCardProps) {
  return (
    <div
      className={cn(
        "glass-panel surface-gradient rounded-[30px] border border-white/80 p-6 shadow-[0_24px_60px_-34px_rgba(76,29,149,0.24)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
