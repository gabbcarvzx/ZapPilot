import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: "ZapPilot | Atendente automático para WhatsApp",
  description: "Atenda clientes, organize pedidos e venda melhor pelo WhatsApp com um atendente automático feito para comércios locais."
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
