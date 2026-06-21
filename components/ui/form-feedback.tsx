import React from "react";

import { StatusBadge } from "@/components/ui/status-badge";

export interface FormFeedbackState {
  tone: "success" | "warning" | "danger";
  title: string;
  message: string;
}

export function FormFeedback({ state }: { state: FormFeedbackState | null }) {
  if (!state) return null;

  const className =
    state.tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : state.tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-rose-200 bg-rose-50 text-rose-900";

  return (
    <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${className}`}>
      <StatusBadge tone={state.tone}>{state.title}</StatusBadge>
      <p className="mt-2 leading-6">{state.message}</p>
    </div>
  );
}
