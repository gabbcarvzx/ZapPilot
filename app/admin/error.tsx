"use client";

import React from "react";
import { useEffect } from "react";

import { logError } from "@/lib/logger";

export default function AdminError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError("app.admin.error_boundary.triggered", {
      metadata: {
        message: error.message,
        digest: error.digest,
        boundary: "admin"
      }
    });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
      <div className="w-full rounded-[32px] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_30px_80px_-52px_rgba(15,23,42,0.65)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-200">Operacao administrativa</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Falha ao carregar a operacao</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          O erro foi isolado nesta camada operacional para evitar impacto mais amplo no painel.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
