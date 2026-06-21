import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
