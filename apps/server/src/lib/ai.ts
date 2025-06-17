import { createGoogleGenerativeAI } from "@ai-sdk/google";
import dotenv from "dotenv";

dotenv.config();
const config = {
  apiKey: process.env.GEMINI_API_KEY,
};

export const google = createGoogleGenerativeAI({
  apiKey: config.apiKey,
});
