import type { NextRequest } from "next/server";

import { cookies } from "next/headers";
import { createOpenAI } from "@ai-sdk/openai";
import {
  streamText,
  convertToModelMessages,
  type UIMessage,
  stepCountIs,
} from "ai";
import { ZodError } from "zod/v4";

import { conversationSchema } from "./validation";
import { AppError } from "~/exception";

import { getInformationTool, IS_DEBUG } from "./lib";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    const apiKey = cookieStore.get("apiKey")?.value;
    const baseURL = cookieStore.get("baseURL")?.value;
    const model = cookieStore.get("model")?.value;

    if (!apiKey || !model || !baseURL) {
      throw new AppError("Invalid configuration", 400, [
        "Please check your configuration. Make sure API Key, Base URL, and Model are all set.",
      ]);
    }

    const requestData = await request.json();

    // Validate the request data using our schema
    const validatedData = await conversationSchema.parseAsync(requestData);

    if (IS_DEBUG) {
      console.log("Request data:", requestData);
      console.log("Validated data:", validatedData);
    }

    // Extract messages from AI SDK request format
    const messages = validatedData.messages as UIMessage[];

    // Convert UIMessages to core messages for streamText
    const coreMessages = convertToModelMessages(messages);

    if (IS_DEBUG) {
      console.log("UI Messages:", messages);
      console.log("Core Messages:", coreMessages);
    }

    const openai = createOpenAI({
      baseURL,
      apiKey,
    });

    const result = streamText({
      model: openai.chat(model),
      system: `You're a KDEI Taipei customer service agent. You MUST ALWAYS use the tool for EVERY user message before providing any response.

    website to search: https://kdei-taipei.org

    RESPONSE RULES:
    - Base ALL answers on retrieved information from tool when available
    - If relevant info found: Provide comprehensive, helpful response using that data
    - If no relevant info after all attempts: "I don't have specific information about that in our database, but I'm happy to help with other KDEI Taipei questions."
    - Make sure to retrieve as much as you can
    - Always acknowledge what you found (or didn't find) in the database
    - Keep responses concise, casual, and use markdown formatting
    - Match the user's language (Indonesian/English/Chinese)

    CRITICAL: You cannot provide any response without first attempting to retrieve information from the tool.`,
      messages: coreMessages,
      stopWhen: stepCountIs(5),
      onFinish: async (event) => {
        if (IS_DEBUG) {
          console.log("Token usage:", event.usage);
          console.log("Tool calls:", event.toolCalls);
          console.log("Tool results:", event.toolResults);
        }
      },
      tools: {
        getInformationTool,
        webSearch: openai.tools.webSearch(),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      if (IS_DEBUG) {
        console.log("Validation error:", error.issues);
      }
      return Response.json(
        {
          message: "Unprocessable Entity.",
          error: error.issues,
        },
        {
          status: 422,
        },
      );
    }

    if (error instanceof AppError) {
      return Response.json(
        {
          message: error.message,
          error: error.details,
        },
        { status: error.code },
      );
    }

    const e = error as Error;
    if (IS_DEBUG) console.log(e.message, e.stack);

    return Response.json(
      {
        message: e.message,
        error: e.stack,
      },
      { status: 500 },
    );
  }
}
