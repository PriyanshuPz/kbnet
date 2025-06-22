import { prisma } from "@kbnet/db";
import { decryptConfig } from "@kbnet/shared/encryptor";
import type { Integration, IntegrationType } from "@kbnet/db/types";
import { parseIntegrationConfig } from "../lib/integration-types";

export async function userSettings(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    const settings = {
      useMindsDB: user.useMindsDB,
      useBYO: user.useBYO,
    };

    return settings;
  } catch (error) {
    return {
      useMindsDB: true,
      useBYO: false,
    };
  }
}

export async function getUserIntegration(
  userId: string,
  type: IntegrationType
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        integrations: {
          where: {
            type: type,
            enabled: true,
          },
        },
      },
    });

    if (!user || !user.integrations.length) return null;

    const integration = user.integrations[0];
    if (!integration) return null;
    return integration;
  } catch (error) {
    console.error("Error fetching user integration:", error);
    return null;
  }
}

export function getIntegrationConfig(integration: Integration) {
  const config = decryptConfig(
    integration.config,
    integration.encryptionIV,
    integration.encryptionAuthTag,
    integration.encryptionKeyVersion
  );

  const parsedConfig = parseIntegrationConfig("GOOGLE", config);
  return parsedConfig;
}
