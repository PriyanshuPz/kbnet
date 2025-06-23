import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { APICallError, generateObject } from "ai";
import dotenv from "dotenv";
import { MAIN_NODE_GEN_MODEL_PROMPT } from "./prompts";
import { z } from "zod";
import { getKBContext } from "./minds";
import { getIntegrationConfig, getUserIntegration } from "../controllers/user";

dotenv.config();

const systemAPIKey = process.env.GEMINI_API_KEY;

export const generativeAI = async (userId: string, enableBYOK: boolean) => {
  let apiKey;

  if (enableBYOK) {
    const integration = await getUserIntegration(userId, "GOOGLE");
    if (!integration) {
      throw new Error("Google integration not found for user.");
    }
    const config = getIntegrationConfig(integration);
    apiKey = config.apiKey;
  } else {
    apiKey = systemAPIKey || "";
  }
  return createGoogleGenerativeAI({
    apiKey: apiKey,
  });
};

export async function generateMapStartPoint(
  userId: string,
  query: string,
  enableBYOK: boolean = false,
  useMindsDB: boolean = true
) {
  try {
    const google = await generativeAI(userId, enableBYOK);
    const kbdata = await getKBContext(query, useMindsDB);

    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      system: MAIN_NODE_GEN_MODEL_PROMPT(query, kbdata),
      schema: z.object({
        mainNode: z.object({
          title: z
            .string()
            .describe(`Title or concept of the main topic: ${query}.`),
          summary: z
            .string()
            .describe(`Detailed summary of the main node: ${query}.`),
        }),
        deepNode: z.object({
          label: z
            .string()
            .describe(`One of the little deep topic of ${query}.`),
          content: z.string().describe("Detailed summary of the deep topic."),
        }),
        relatedNode: z.object({
          label: z.string().describe(`Question or related ${query}.`),
          hint: z.string().describe("Detailed summary of the related topic."),
        }),
        similarNode: z.object({
          label: z
            .string()
            .describe(`Similar topic to the main node: ${query}.`),
          hint: z.string().describe("Detailed summary of the similar topic."),
        }),
      }),
      prompt: `Create a beginner-friendly knowledge map starting point for: "${query}"`,
    });

    return object;
  } catch (error) {
    if (APICallError.isInstance(error)) {
      if (error.statusCode === 429) {
        throw new Error(
          "Rate limit exceeded. Please try switching BYOK settings."
        );
      }
      if (error.statusCode === 401) {
        throw new Error(
          "Invalid API key. Please check your Google API key settings."
        );
      }
      throw new Error(
        `API call failed with status code ${error.statusCode}: ${error.message}`
      );
    }

    console.error("Error generating map start point:", error);
    throw new Error("Failed to generate map start point.");
  }
}

export async function generateMapNode(
  type: "DEEP" | "RELATED" | "SIMILAR",
  userId: string,
  system: string,
  enableBYOK: boolean,
  query?: string
) {
  try {
    const google = await generativeAI(userId, enableBYOK);
    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      system,
      schema: z.object({
        label: z.string().describe(`Label for the ${type} node.`),
        content: z.string().describe(`Detailed content for the ${type} node.`),
      }),
      prompt: `Generate a ${type.toLowerCase()} node based on the main node "${query}"`,
    });

    return object;
  } catch (error) {
    if (APICallError.isInstance(error)) {
      if (error.statusCode === 429) {
        throw new Error(
          "Rate limit exceeded. Please try switching BYOK settings."
        );
      }
      if (error.statusCode === 401) {
        throw new Error(
          "Invalid API key. Please check your Google API key settings."
        );
      }
      throw new Error(
        `API call failed with status code ${error.statusCode}: ${error.message}`
      );
    }
    console.error("Error generating map node:", error);
    throw new Error(`Failed to generate ${type.toLowerCase()} node.`);
  }
}
