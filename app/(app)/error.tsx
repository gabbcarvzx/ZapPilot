"use client";

import React from "react";
import { useEffect } from "react";

import { logError } from "@/lib/logger";

export default function ProtectedError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError("app.protected.error_boundary.triggered", {
      metadata: {
        message: error.message,
        digest: error.digest,
        boundary: "app"
      }
    });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
      <div className="w-full rounded-[32px] border border-amber-200 bg-amber-50/80 p-8 shadow-[0_26px_70px_-46px_rgba(180,83,9,0.28)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Painel protegido</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Nao foi possivel carregar esta area</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
          A falha foi isolada nesta area do painel. Os logs estruturados foram registrados para investigacao operacional.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 inline-flex rounded-2xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
