import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: "ZapPilot | WhatsApp vendendo por voce",
  description: "Seu WhatsApp atendendo clientes automaticamente, mesmo quando voce esta ocupado."
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
