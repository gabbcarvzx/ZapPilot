import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { MessageSimulatorForm } from "../../components/forms/message-simulator-form";

describe("message simulator guidance", () => {
  it("explains simulated mode and real-channel validation expectations", () => {
    const markup = renderToStaticMarkup(<MessageSimulatorForm businessId="biz_demo" />);

    expect(markup).toContain("modo simulado");
    expect(markup).toContain("canal real");
    expect(markup).toContain("O que observar");
  });
});
