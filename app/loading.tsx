import React from "react";

function LoadingLine({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-violet-100 ${className}`} />;
}

export default function AppLoading() {
  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 py-6">
      <div className="animate-pulse rounded-[32px] border border-violet-100 bg-white/90 p-8 shadow-sm shadow-violet-900/5">
        <p className="text-sm font-medium text-violet-700">Carregando experiencia</p>
        <div className="mt-4 space-y-3">
          <LoadingLine className="h-4 w-32" />
          <LoadingLine className="h-10 w-72 max-w-full" />
          <LoadingLine className="h-4 w-full max-w-2xl" />
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-[28px] border border-violet-100 bg-white/90 p-6 shadow-sm shadow-violet-900/5">
            <LoadingLine className="h-4 w-28" />
            <LoadingLine className="mt-5 h-10 w-20" />
            <LoadingLine className="mt-4 h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
