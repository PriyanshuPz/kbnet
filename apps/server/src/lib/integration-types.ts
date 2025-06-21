import { IntegrationType } from "@kbnet/db/types";
import { z } from "zod";

export const IntegrationConfigSchemas = {
  [IntegrationType.GOOGLE]: z.object({
    apiKey: z.string().min(1, "API key is required"),
  }),
} as const;

export type IntegrationConfigMap = {
  [K in keyof typeof IntegrationConfigSchemas]: z.infer<
    (typeof IntegrationConfigSchemas)[K]
  >;
};

export function parseIntegrationConfig<T extends IntegrationType>(
  type: T,
  decryptedJson: string
): IntegrationConfigMap[T] {
  const schema = IntegrationConfigSchemas[type];
  const parsed = JSON.parse(decryptedJson);

  return schema.parse(parsed) as IntegrationConfigMap[T];
}
