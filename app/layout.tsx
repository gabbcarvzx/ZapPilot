import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: "ZapPilot | Atendente automatico para WhatsApp",
  description: "Automatize atendimentos, responda clientes e venda mais pelo WhatsApp com uma operacao comercial mais organizada."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="text-slate-950 antialiased">
        <div className="min-h-screen">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
