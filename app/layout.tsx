import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: "ZapPilot Local",
  description: "Transforme seu WhatsApp em um atendente automático que responde clientes, tira dúvidas e ajuda a vender todos os dias."
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
