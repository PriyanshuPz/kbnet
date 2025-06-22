import { auth } from "@/lib/auth";
import { prisma } from "@kbnet/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { encryptConfig } from "@kbnet/shared/encryptor";

type SetupRequestBody = {
  mindsdb: boolean;
  googleAI: boolean;
  apiKey?: string;
};

async function handleGoogleAIIntegration(
  userId: string,
  googleAI: boolean,
  apiKey?: string,
  existingIntegration?: any
) {
  // Case 1: Enabling Google AI
  if (googleAI) {
    // Case 1a: New integration - API key required
    if (!existingIntegration && !apiKey) {
      throw new Error("API key is required for new Google AI integration");
    }

    // Case 1b: Existing integration - just enable if no new key
    if (existingIntegration && !apiKey) {
      return prisma.integration.update({
        where: {
          userId_type: {
            userId,
            type: "GOOGLE",
          },
        },
        data: { enabled: true },
      });
    }

    // Case 1c: New key provided (for both new and existing)
    const { encrypted, iv, authTag } = encryptConfig(
      JSON.stringify({ apiKey })
    );

    const integrationData = {
      config: encrypted,
      encryptionIV: iv,
      encryptionAuthTag: authTag,
      enabled: true,
    };

    return existingIntegration
      ? prisma.integration.update({
          where: {
            userId_type: {
              userId,
              type: "GOOGLE",
            },
          },
          data: integrationData,
        })
      : prisma.integration.create({
          data: {
            ...integrationData,
            userId,
            type: "GOOGLE",
          },
        });
  }

  // Case 2: Disabling Google AI
  if (existingIntegration) {
    return prisma.integration.update({
      where: {
        userId_type: {
          userId,
          type: "GOOGLE",
        },
      },
      data: { enabled: false },
    });
  }

  return null;
}

async function updateUserSettings(userId: string, settings: SetupRequestBody) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      useMindsDB: settings.mindsdb,
      useBYO: settings.googleAI,
    },
  });
}

export async function POST(request: Request) {
  try {
    // 1. Authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get request body
    const body: SetupRequestBody = await request.json();

    // 3. Get existing integration
    const existingIntegration = await prisma.integration.findUnique({
      where: {
        userId_type: {
          userId: session.user.id,
          type: "GOOGLE",
        },
      },
    });

    // 4. Handle Google AI integration
    try {
      await handleGoogleAIIntegration(
        session.user.id,
        body.googleAI,
        body.apiKey,
        existingIntegration
      );
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }

    // 5. Update user settings
    await updateUserSettings(session.user.id, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating/updating settings:", error);
    return NextResponse.json(
      { error: "Failed to create/update settings" },
      { status: 500 }
    );
  }
}
