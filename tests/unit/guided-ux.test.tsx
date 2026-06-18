import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { EmptyState } from "../../components/dashboard/empty-state";
import { Tooltip } from "../../components/ui/tooltip";

describe("guided onboarding ux helpers", () => {
  it("renders a reusable empty state with title, description and action copy", () => {
    const markup = renderToStaticMarkup(
      <EmptyState
        title="Nenhuma conversa ainda"
        description="Use o simulador para gerar a primeira conversa durante uma demo."
        actionLabel="Abrir simulador"
      />
    );

    expect(markup).toContain("Nenhuma conversa ainda");
    expect(markup).toContain("Use o simulador para gerar a primeira conversa");
    expect(markup).toContain("Abrir simulador");
  });

  it("renders helper copy alongside the tooltip label", () => {
    const markup = renderToStaticMarkup(
      <Tooltip label="Verify token" content="Use o mesmo token cadastrado na Meta para validar o webhook." />
    );

    expect(markup).toContain("Verify token");
    expect(markup).toContain("Use o mesmo token cadastrado na Meta");
  });
});
