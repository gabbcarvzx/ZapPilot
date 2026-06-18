import React from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
}

export function EmptyState({ title, description, actionLabel }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-700">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-2 leading-6 text-slate-600">{description}</p>
      {actionLabel ? (
        <p className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
          {actionLabel}
        </p>
      ) : null}
    </div>
  );
}
