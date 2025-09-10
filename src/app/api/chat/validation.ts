import { z } from "zod/v4";

export const chatSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

export const conversationSchema = z.array(chatSchema);

export type ChatSchema = z.infer<typeof chatSchema>;
export type ConversationSchema = z.infer<typeof conversationSchema>;
