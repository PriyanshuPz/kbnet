import { createGoogleGenerativeAI } from "@ai-sdk/google";

const config = {
  apiKey: process.env.GEMINI_API_KEY,
};

export const google = createGoogleGenerativeAI({
  apiKey: config.apiKey,
});
