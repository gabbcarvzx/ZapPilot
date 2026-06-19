import { AppShell } from "@/components/dashboard/app-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MessageSimulatorForm } from "@/components/forms/message-simulator-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
              <Card key={conversation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{conversation.contactName || conversation.contactPhone}</CardTitle>
                    <Badge>{conversation.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {conversation.messages.map((message: (typeof conversation.messages)[number]) => (
                    <div
                      key={message.id}
                      className={`rounded-2xl px-4 py-3 text-sm ${message.direction === "OUTBOUND" ? "ml-10 bg-teal-50 text-teal-900" : "mr-10 bg-slate-100 text-slate-800"}`}
                    >
                      {message.content}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
