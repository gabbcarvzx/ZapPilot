import { AppShell } from "@/components/dashboard/app-shell";
import { AssistantForm } from "@/components/forms/assistant-form";
import { requireUser } from "@/lib/guards";
import { getBusinessSnapshot } from "@/server/services/business-service";

export default async function AssistantPage() {
  const user = await requireUser();
  const business = await getBusinessSnapshot(user.businessId);
  if (!business) return null;

  return (
    <AppShell title="Atendente automático" subtitle="Defina o comportamento comercial, catálogo básico e FAQ do seu atendente.">
      <AssistantForm business={business} products={business.products} faqs={business.faqs} />
    </AppShell>
  );
}
