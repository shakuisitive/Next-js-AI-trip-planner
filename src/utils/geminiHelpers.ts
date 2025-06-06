//google-gemini-clone/src/utils/geminiHelpers.ts
import { GoogleGenerativeAI } from "../../node_modules/@google-chat/generative-ai";

import { ChatHistory, GenerationConfig, ChatSettings } from "@/types";
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is not defined in the environment variables."
  );
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function chattogemini(
  userMessage: string,
  history: ChatHistory,
  settings: ChatSettings
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: settings.model || "gemini-1.5-flash",
    systemInstruction:
      settings.systemInstruction || "you are a helpful assistant",
  });

  const generationConfig: GenerationConfig = {
    temperature: settings.temperature || 1,
    topP: 0.95,
    responseMimeType: "text/plain",
  };

  const chatSession = model.startChat({
    generationConfig,
    history: history,
  });

  try {
    const result = await chatSession.sendMessage(userMessage);
    return result.response.text();
  } catch (error) {
    console.error("Error interacting with the model:", error);
    throw error;
  }
}
