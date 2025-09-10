"use server";

import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import { cookies } from "next/headers";
import { ZodError } from "zod/v4";

import { cookieSchema } from "~/cookie/validation";

export interface AIConfig {
  baseURL: string;
  apiKey: string;
  model: string;
}

const DEFAULT_SECURE_COOKIE = {
  name: "",
  value: "",
  httpOnly: true,
  secure: true,
  sameSite: "strict",
} satisfies ResponseCookie;

export async function setAIConfig({ baseURL, apiKey, model }: AIConfig) {
  try {
    const cookieStore = await cookies();

    await cookieSchema.parseAsync({ baseURL, apiKey, model });

    cookieStore.set({
      ...DEFAULT_SECURE_COOKIE,
      name: "baseURL",
      value: baseURL,
    });
    cookieStore.set({
      ...DEFAULT_SECURE_COOKIE,
      name: "apiKey",
      value: apiKey,
    });
    cookieStore.set({
      ...DEFAULT_SECURE_COOKIE,
      name: "model",
      value: model,
    });

    return {
      success: true,
      message: "Successfully set the config!",
    };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: error.message,
      };
    }

    const e = error as Error;

    return {
      success: false,
      message: e.message,
    };
  }
}
