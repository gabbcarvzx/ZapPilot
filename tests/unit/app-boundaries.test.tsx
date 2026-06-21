import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import AppError from "../../app/error";
import AppLoading from "../../app/loading";
import ProtectedError from "../../app/(app)/error";
import ProtectedLoading from "../../app/(app)/loading";
import AdminError from "../../app/admin/error";
import AdminLoading from "../../app/admin/loading";

describe("error and loading boundaries", () => {
  it("renders friendly retry copy in root and protected error boundaries", () => {
    const reset = () => undefined;

    const rootMarkup = renderToStaticMarkup(<AppError error={new Error("boom")} reset={reset} />);
    const protectedMarkup = renderToStaticMarkup(<ProtectedError error={new Error("boom")} reset={reset} />);
    const adminMarkup = renderToStaticMarkup(<AdminError error={new Error("boom")} reset={reset} />);

    expect(rootMarkup).toContain("Algo saiu do fluxo esperado");
    expect(rootMarkup).toContain("Tentar novamente");
    expect(protectedMarkup).toContain("Nao foi possivel carregar esta area");
    expect(adminMarkup).toContain("Falha ao carregar a operacao");
  });

  it("renders loading placeholders without shifting the main structure", () => {
    const rootMarkup = renderToStaticMarkup(<AppLoading />);
    const protectedMarkup = renderToStaticMarkup(<ProtectedLoading />);
    const adminMarkup = renderToStaticMarkup(<AdminLoading />);

    expect(rootMarkup).toContain("animate-pulse");
    expect(protectedMarkup).toContain("Carregando painel");
    expect(adminMarkup).toContain("Carregando operacao");
  });
});
