import type { UIMessage, UseChatHelpers } from "@ai-sdk/react";

import { Controller, useFormContext } from "react-hook-form";
import { memo, useCallback } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Send from "@mui/icons-material/Send";

import { cn } from "~/lib";

import { type InputData, useChatInput, useChatMessages } from "./ChatContext";

type ChatInputProps = {
  sendMessage: UseChatHelpers<UIMessage>["sendMessage"];
};

// Memoized shell that does NOT subscribe to react-hook-form
const ChatInput = memo(function ChatInput({ sendMessage }: ChatInputProps) {
  console.log("ChatInput Rerender (shell)");

  const { isNewChat, setIsNewChat } = useChatInput();

  const onSubmitMessage = useCallback(
    (message: string) => {
      if (isNewChat) setIsNewChat(false);
      if (message.trim() === "") return;
      sendMessage({ text: message });
    },
    [isNewChat, sendMessage, setIsNewChat],
  );

  return <ChatTextField onSubmitMessage={onSubmitMessage} />;
});

function ChatTextField({
  onSubmitMessage,
}: {
  onSubmitMessage: (message: string) => void;
}) {
  const { control, handleSubmit, reset } = useFormContext<InputData>();
  const { isLoading } = useChatMessages();

  const handleSubmitCallback = useCallback(handleSubmit, []);

  const onFormSubmit = useCallback(
    (data: InputData) => {
      reset({ message: "" });
      onSubmitMessage(data.message);
    },
    [onSubmitMessage, reset],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmitCallback(onFormSubmit)();
      }
    },
    [handleSubmitCallback, onFormSubmit],
  );

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit(onFormSubmit)}
      className="relative bg-pink-300/5"
    >
      <Controller
        name="message"
        control={control}
        disabled={isLoading}
        render={({ field }) => (
          <TextField
            {...field}
            disabled={isLoading}
            onKeyDown={handleKeyDown}
            label="Tanyakan sesuatu"
            placeholder="Tulis pertanyaan kamu di sini…"
            multiline
            minRows={1}
            maxRows={4}
            fullWidth
            variant="outlined"
            className={cn("transition-all duration-200")}
            slotProps={{
              input: {
                className: cn(
                  "text-sm sm:text-base leading-relaxed",
                  "placeholder-gray-500",
                  "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
                  "min-h-[48px]",
                ),
                style: {
                  fontSize: "16px", // Prevents zoom on iOS
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      aria-label="send message"
                      type="submit"
                      color="primary"
                      disabled={isLoading || field.value.trim() === ""}
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
              inputLabel: {
                className: "text-gray-500",
              },
            }}
          />
        )}
      />
    </Paper>
  );
}

export default ChatInput;
