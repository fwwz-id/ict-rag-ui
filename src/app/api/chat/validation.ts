import { z } from "zod/v4";

// AI SDK UIMessage part types
const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  state: z.enum(["done", "streaming"]).optional(),
});

const stepStartPartSchema = z.object({
  type: z.literal("step-start"),
});

const toolPartSchema = z.object({
  type: z.string().regex(/^tool-/), // Must start with "tool-"
  toolCallId: z.string().optional(),
  toolName: z.string().optional(),
  state: z.enum(["input-available", "output-available"]).optional(),
  input: z.unknown().optional(),
  output: z.unknown().optional(),
  errorText: z.string().optional(),
});

const messagePartSchema = z.union([
  textPartSchema,
  stepStartPartSchema,
  toolPartSchema,
]);

// AI SDK UIMessage format
export const uiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["system", "user", "assistant"]),
  parts: z.array(messagePartSchema),
});

// AI SDK request format (what useChat sends)
export const aiRequestSchema = z.object({
  id: z.string().optional(),
  messages: z.array(uiMessageSchema),
  // useChat may send different trigger identifiers depending on transport
  // support common variants while keeping this optional for forward-compatibility
  trigger: z
    .enum([
      "submit-user-message",
      "regenerate-assistant-message",
      "submit-message",
      "regenerate-message",
    ])
    .optional(),
});

// Only support AI SDK format
export const conversationSchema = aiRequestSchema;

export type UIMessagePart = z.infer<typeof messagePartSchema>;
export type UIMessage = z.infer<typeof uiMessageSchema>;
export type AIRequestSchema = z.infer<typeof aiRequestSchema>;
export type ConversationSchema = z.infer<typeof conversationSchema>;
