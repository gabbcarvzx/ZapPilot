export interface IntegrationStatus {
  name: string;
  configured: boolean;
  mode: "Ativo" | "Simulado";
  description: string;
  nextStep: string;
}
