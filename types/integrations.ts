export interface IntegrationStatus {
  name: string;
  configured: boolean;
  mode: "mock" | "live";
  description: string;
  nextStep: string;
}
