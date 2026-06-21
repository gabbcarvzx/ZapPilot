import React, { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  aside,
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-700">{eyebrow}</p> : null}
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 md:text-[2rem]">{title}</h2>
        {description ? <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">{description}</p> : null}
      </div>
      {aside}
    </div>
  );
}
