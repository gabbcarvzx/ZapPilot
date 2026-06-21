import { AppShell } from "@/components/dashboard/app-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MessageSimulatorForm } from "@/components/forms/message-simulator-form";
import { PremiumCard } from "@/components/ui/premium-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/guards";
import { listMessagesForBusiness } from "@/server/services/message-service";

export default async function MessagesPage() {
  const user = await requireUser();
  const conversations = await listMessagesForBusiness(user.businessId);

  return (
    <AppShell title="Conversas e simulacao" subtitle="Veja as conversas salvas e simule novos atendimentos sem depender da Meta.">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <MessageSimulatorForm businessId={user.businessId} />
        <div className="space-y-4">
          {conversations.length === 0 ? (
            <EmptyState
              title="Nenhuma conversa ainda"
              description="Use o simulador ao lado para gerar uma conversa inicial e mostrar ao lead como o atendimento responde na pratica."
              actionLabel="Simule a primeira mensagem agora"
            />
          ) : (
            conversations.map((conversation: (typeof conversations)[number]) => (
              <PremiumCard key={conversation.id}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">{conversation.contactName || conversation.contactPhone}</h2>
                  <StatusBadge tone="brand">{conversation.status}</StatusBadge>
                </div>
                <div className="mt-4 space-y-3">
                  {conversation.messages.map((message: (typeof conversation.messages)[number]) => (
                    <div
                      key={message.id}
                      className={`rounded-3xl px-4 py-3 text-sm shadow-sm ${
                        message.direction === "OUTBOUND"
                          ? "ml-10 bg-violet-600 text-white shadow-violet-900/15"
                          : "mr-10 bg-slate-100 text-slate-800 shadow-slate-900/5"
                      }`}
                    >
                      {message.content}
                    </div>
                  ))}
                </div>
              </PremiumCard>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
