import { MessageType } from "./constants";

export function pack(type: MessageType, data: Record<string, any>): string {
  return JSON.stringify({
    type: type,
    payload: data,
  });
}

export function unpack(data: any): {
  type: MessageType;
  payload: Record<string, any>;
} {
  try {
    const parsed = JSON.parse(data);
    if (parsed && parsed.type && parsed.payload) {
      return {
        type: parsed.type as MessageType,
        payload: parsed.payload,
      };
    } else {
      throw new Error("Invalid payload structure");
    }
  } catch (error) {
    console.error("Failed to parse payload:", error);
    throw error;
  }
}

export function calculateXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}
