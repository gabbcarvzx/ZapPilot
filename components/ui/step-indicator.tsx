import React from "react";

import { cn } from "@/lib/utils";

export function StepIndicator({
  steps,
  currentStep = steps.length
}: {
  steps: string[];
  currentStep?: number;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {steps.map((step, index) => {
        const active = index < currentStep;
        return (
          <div
            key={step}
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm font-medium",
              active ? "border-violet-200 bg-violet-50 text-violet-900" : "border-slate-200 bg-white/75 text-slate-500"
            )}
          >
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold ring-1 ring-inset ring-current/10">
              {index + 1}
            </span>
            {step}
          </div>
        );
      })}
    </div>
  );
}
