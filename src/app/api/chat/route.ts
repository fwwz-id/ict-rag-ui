import type { NextRequest } from "next/server";

import { cookies } from "next/headers";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { ZodError } from "zod/v4";

import { type ConversationSchema, conversationSchema } from "./validation";
import { AppError } from "~/exception";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ConversationSchema;
    const cookieStore = await cookies();

    const apiKey = cookieStore.get("apiKey")?.value;
    const baseURL = cookieStore.get("baseURL")?.value;
    const model = cookieStore.get("model")?.value;

    if (!apiKey || !model || !baseURL) {
      throw new AppError("Invalid configuration", 400, [
        "Please check your configuration",
      ]);
    }

    await conversationSchema.parseAsync(body);

    const openai = createOpenAI({
      baseURL,
      apiKey,
    });

    const result = streamText({
      model: openai.chat(model),
      system:
        `You're a customer service of KDEI Taipei (unofficial embassy of indonesia in taiwan) that responds with context provided.
        If you're not sure about something, just say you don't know.
        if user only greet you without other follow up questions, greet them by '<greetings>!, Could you please tell me whats your name and how can I help you today?'.
        Make sure to answer with the same language as the user.
        Please keep your answers concise and to the point. use casual and exited tone, also response with markdown.`.trim(),
      messages: body,
      temperature: 0.4,
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          message: "Unprocessable Entity.",
          error: error.issues,
        },
        {
          status: 422,
        }
      );
    }

    if (error instanceof AppError) {
      return Response.json(
        {
          message: error.message,
          error: error.details,
        },
        { status: error.code }
      );
    }

    const e = error as Error;
    console.log(e);

    return Response.json(
      {
        message: e.message,
        error: e.stack,
      },
      { status: 500 }
    );
  }
}
