"use client";

import type { UIMessage } from "ai";
import type { UseChatHelpers } from "@ai-sdk/react";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { FormProvider, useForm } from "react-hook-form";

// Separate contexts for different concerns
interface ChatMessagesContextType extends Partial<UseChatHelpers<UIMessage>> {
  // branches: Record<string, Branch>;
  isLoading: boolean;
  // onBranchPrev: (messageId: string) => void;
  // onBranchNext: (messageId: string) => void;
}

interface ChatInputContextType {
  /** indicates wheter this is a new fresh chat, this help to decided display suggestion bar or not*/
  isNewChat: boolean;
  setIsNewChat: (bool: boolean) => void;
}

interface ChatToolbarContextType {
  onShowConfig: () => void;
  onCloseConfig: () => void;
  isConfigOpen: boolean;
}

export interface InputData {
  message: string;
}

// Create contexts
const ChatMessagesContext = createContext<ChatMessagesContextType | null>(null);
const ChatInputContext = createContext<ChatInputContextType | null>(null);
const ChatToolbarContext = createContext<ChatToolbarContextType | null>(null);

// Context providers - using value prop pattern for cleaner API
export function ChatMessagesProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: ChatMessagesContextType;
}) {
  return <ChatMessagesContext value={value}>{children}</ChatMessagesContext>;
}

export function ChatInputProvider({ children }: { children: React.ReactNode }) {
  const methods = useForm<InputData>({
    defaultValues: { message: "" },
    mode: "onChange",
  });

  const [isNewChat, setIsNewChat] = useState(true);

  // Stabilize context value to only change when isNewChat toggles
  const inputValue = useMemo(() => ({ isNewChat, setIsNewChat }), [isNewChat]);

  return (
    <FormProvider {...methods}>
      <ChatInputContext value={inputValue}>{children}</ChatInputContext>
    </FormProvider>
  );
}

export function ChatToolbarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const onShowConfig = useCallback(() => {
    setIsConfigOpen(() => true);
  }, []);

  const onCloseConfig = useCallback(() => {
    setIsConfigOpen(() => false);
  }, []);

  const value = useMemo(
    () => ({ isConfigOpen, onShowConfig, onCloseConfig }),
    [isConfigOpen, onShowConfig, onCloseConfig],
  );

  return <ChatToolbarContext value={value}>{children}</ChatToolbarContext>;
}

// Custom hooks for using contexts
export function useChatMessages() {
  const context = useContext(ChatMessagesContext);
  if (!context) {
    throw new Error("useChatMessages must be used within ChatMessagesProvider");
  }
  return context;
}

export function useChatInput() {
  const context = useContext(ChatInputContext);
  if (!context) {
    throw new Error("useChatInput must be used within ChatInputProvider");
  }
  return context;
}

export function useChatToolbar() {
  const context = useContext(ChatToolbarContext);
  if (!context) {
    throw new Error("useChatToolbar must be used within ChatToolbarProvider");
  }
  return context;
}
