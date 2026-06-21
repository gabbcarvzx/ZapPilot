"use client";

import React from "react";
import { useEffect } from "react";

import { logError } from "@/lib/logger";

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError("app.error_boundary.triggered", {
      metadata: {
        message: error.message,
        digest: error.digest,
        boundary: "root"
      }
    });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center px-4 py-10">
      <div className="w-full rounded-[32px] border border-rose-200 bg-white p-8 shadow-[0_30px_80px_-50px_rgba(190,24,93,0.35)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-600">Estabilidade operacional</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Algo saiu do fluxo esperado</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          O sistema capturou uma falha inesperada e bloqueou a continuidade desta tela para proteger a operacao.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
