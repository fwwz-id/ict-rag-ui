import { z } from "zod/v4";

export const cookieSchema = z.object({
  baseURL: z.url().min(1),
  apiKey: z.string().min(1),
  model: z.string().min(5),
});