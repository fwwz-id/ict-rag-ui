"use client";

import type { InputData } from "./ChatContext";

import { memo, useCallback, useMemo } from "react";
import { Button, Typography, Stack } from "@mui/material";
import { cn } from "~/lib";
import { useFormContext } from "react-hook-form";

// Memoized component to prevent unnecessary re-renders
const SuggestionBar = memo(function SuggestionBar({
  isNewChat,
}: {
  isNewChat: boolean;
}) {
  const { setValue } = useFormContext<InputData>();

  const suggestions = useMemo(
    () => [
      "Apa syarat mengurus paspor?",
      "Bagaimana cara legalisir dokumen?",
      "Jam layanan KDEI Taipei?",
      "Bantuan untuk PMI di Taiwan",
    ],
    [],
  );

  const onPick = useCallback(
    (value: string) => setValue("message", value),
    [setValue],
  );

  if (!isNewChat) {
    console.log("Rerender Suggestion bar 0 messages (if-block)");
    return null;
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <Typography
          variant="h6"
          component="h2"
          className="text-center mb-4 text-gray-600 font-medium text-lg sm:text-xl"
        >
          Mulai percakapan dengan pertanyaan berikut:
        </Typography>

        <Stack
          spacing={2}
          className="flex flex-col items-center gap-3 sm:gap-2 px-4"
        >
          {suggestions.map((s, idx) => (
            <Button
              key={idx}
              onClick={() => onPick(s)}
              variant="outlined"
              size="medium"
              className={cn(
                "w-full max-w-80 h-12 sm:h-9",
                "px-4 py-2",
                "text-sm sm:text-xs font-medium",
                "rounded-3xl sm:rounded-2xl",
                "border border-primary text-primary",
                "bg-transparent hover:bg-primary hover:text-white",
                "active:scale-98",
                "transition-all duration-200 ease-in-out",
                "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1",
                "normal-case",
              )}
            >
              {s}
            </Button>
          ))}
        </Stack>
      </div>
    </div>
  );
});

export default SuggestionBar;
