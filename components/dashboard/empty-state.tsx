import React from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
}

export function EmptyState({ title, description, actionLabel }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-violet-200 bg-violet-50/70 p-5 text-sm text-slate-700">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-2 leading-6 text-slate-600">{description}</p>
      {actionLabel ? (
        <p className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-violet-800 shadow-sm ring-1 ring-violet-100">
          {actionLabel}
        </p>
      ) : null}
    </div>
  );
}
