import type { SetStateAction } from "react";

import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toggler(fn: (value: SetStateAction<boolean>) => void) {
  return () => fn((prev) => !prev);
}
