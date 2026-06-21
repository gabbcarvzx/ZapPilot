import React from "react";

function LoadingLine({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-violet-100 ${className}`} />;
}

export default function ProtectedLoading() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
      <div className="animate-pulse rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_30px_70px_-40px_rgba(76,29,149,0.18)] md:p-6">
        <p className="text-sm font-medium text-violet-700">Carregando painel</p>
        <div className="mt-4 space-y-3">
          <LoadingLine className="h-4 w-28" />
          <LoadingLine className="h-10 w-80 max-w-full" />
          <LoadingLine className="h-4 w-full max-w-2xl" />
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-[28px] border border-violet-100 bg-white/90 p-6 shadow-sm shadow-violet-900/5">
            <LoadingLine className="h-4 w-24" />
            <LoadingLine className="mt-5 h-10 w-20" />
            <LoadingLine className="mt-4 h-4 w-full" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="animate-pulse rounded-[32px] border border-violet-100 bg-white/90 p-6 shadow-sm shadow-violet-900/5">
          <LoadingLine className="h-6 w-48" />
          <LoadingLine className="mt-4 h-4 w-full" />
          <LoadingLine className="mt-2 h-4 w-5/6" />
        </div>
        <div className="animate-pulse rounded-[32px] border border-violet-100 bg-white/90 p-6 shadow-sm shadow-violet-900/5">
          <LoadingLine className="h-6 w-40" />
          <LoadingLine className="mt-4 h-4 w-full" />
          <LoadingLine className="mt-2 h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}
