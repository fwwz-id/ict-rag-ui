"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import CircularProgress from "@mui/material/CircularProgress";

import ConfigDialog from "~/components/ConfigDialog";
import SuggestionBar from "~/components/SuggestionBar";
import ChatToolbar from "~/components/ChatToolbar";
import ChatMessages from "~/components/ChatMessages";
import ChatInput from "~/components/ChatInput";
import {
  ChatMessagesProvider,
  ChatInputProvider,
  ChatToolbarProvider,
} from "./ChatContext";
import { useChatPersistence } from "~/hooks/useChatPersistence";

type Defaults = {
  apiKey: string;
  baseURL: string;
  model: string;
};

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ChatApp({
  defaults,
  chatId,
}: {
  defaults: Defaults;
  chatId: string;
}) {
  const router = useRouter();

  const { initialMessages, isLoaded, saveMessages } =
    useChatPersistence(chatId);

  const {
    messages,
    status,
    error,
    sendMessage,
    setMessages,
    regenerate,
    stop,
  } = useChat({
    experimental_throttle: 300,
  });

  // Simple preparation flag shown before we decide to show suggestions or hydrated chat
  const hasHydratedRef = useRef(false);
  const [isPreparing, setIsPreparing] = useState(true);

  const defaultsMemoized = useMemo(() => {
    console.log("Memoized defaults: ", defaults);
    return defaults;
  }, [defaults]);

  const memoizedError = useMemo(() => {
    console.log("Memoized error: ", error);
    return error;
  }, [error]);

  const isStreaming = useMemo(() => status === "streaming", [status]);
  const isSubmitted = useMemo(() => status === "submitted", [status]);
  const isIdle = useMemo(
    () => !(status === "streaming" || status === "submitted"),
    [status],
  );

  const isLoadingMemoized = useMemo(() => {
    console.log("isStreaming:", isStreaming, " isSubmitted:", isSubmitted);
    return isStreaming || isSubmitted;
  }, [isSubmitted, isStreaming]);

  const isNewChat = useMemo(() => messages.length < 1, [messages]);

  // Event handlers - reorder to fix dependency issues
  const handleNewChat = useCallback(() => {
    const newId = randomId();
    router.push(`/${newId}`);
  }, [router]);

  const handleClear = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  const handleRegenerate = useCallback(async () => {
    try {
      await regenerate();
    } catch (error) {
      console.warn("Regeneration failed:", error);
    }
  }, [regenerate]);

  useEffect(() => {
    if (!isLoaded) return; // still preparing until storage read completes
    if (hasHydratedRef.current) return;

    if (messages.length > 0) {
      // Already have messages (e.g., server/state), finish preparing
      setIsPreparing(false);
      hasHydratedRef.current = true;
      return;
    }

    if (initialMessages && initialMessages.length > 0) {
      // Hydrate from storage
      setMessages(initialMessages);
      // Finish preparing after commit
      requestAnimationFrame(() => setIsPreparing(false));
    } else {
      // Nothing to hydrate
      setIsPreparing(false);
    }
    hasHydratedRef.current = true;
  }, [isLoaded, initialMessages, messages.length, setMessages]);

  useEffect(() => {
    saveMessages(messages);
  }, [saveMessages, messages]);

  return (
    <ChatMessagesProvider
      value={{
        isLoading: isLoadingMemoized,
      }}
    >
      <ChatInputProvider>
        <ChatToolbarProvider>
          <div className="flex flex-col h-full border border-primary/5 rounded-2xl">
            {/* Toolbar - compact on mobile */}
            <div className="flex-shrink-0">
              <ChatToolbar
                onClear={handleClear}
                onRegenerate={handleRegenerate}
                onAbort={stop}
                onNewChat={handleNewChat}
                hasMessages={!isNewChat}
                isLoading={isLoadingMemoized}
              />
            </div>

            {/* Main chat area - grows to fill available space */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Preparing banner shown by default until we know if there's stored chat */}
              {isPreparing ? (
                <div className="px-3 py-2 text-gray-600 text-sm flex items-center gap-2">
                  <CircularProgress size={16} className="text-gray-500" />
                  <span>Preparing a chat session…</span>
                </div>
              ) : (
                <SuggestionBar isNewChat={isNewChat} />
              )}

              <div className="flex-1 overflow-hidden">
                <ChatMessages
                  messages={messages}
                  isSubmitted={isSubmitted}
                  isStreaming={isStreaming}
                  isIdle={isIdle}
                  error={memoizedError}
                />
              </div>

              {/* No overlay/fade; keep UI responsive */}

              {/* Input area - always at bottom */}
              <div className="flex-shrink-0 px-2 sm:p-4">
                <ChatInput sendMessage={sendMessage} />
              </div>
            </div>

            {/* Settings dialog */}
            <ConfigDialog defaults={defaultsMemoized} />
          </div>
        </ChatToolbarProvider>
      </ChatInputProvider>
    </ChatMessagesProvider>
  );
}
