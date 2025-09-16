"use server";

import { cookies } from "next/headers";
import { cookieSchema } from "./validation";

export async function saveCookies(data: {
  baseURL: string;
  apiKey: string;
  model: string;
}) {
  const result = cookieSchema.safeParse(data);
  if (!result.success) {
    throw new Error("Invalid configuration data");
  }

  const cookieStore = await cookies();
  const maxAge = 60 * 60 * 24 * 30; // 30 days

  cookieStore.set("baseURL", data.baseURL, {
    path: "/",
    maxAge,
    httpOnly: false, // Needed for client-side access in this case
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  cookieStore.set("apiKey", data.apiKey, {
    path: "/",
    maxAge,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  cookieStore.set("model", data.model, {
    path: "/",
    maxAge,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}
