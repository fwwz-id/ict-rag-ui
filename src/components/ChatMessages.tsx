import type { UIMessage } from "ai";

import { useEffect, useMemo, useRef, memo, useCallback } from "react";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import { Box, CircularProgress, Typography, Fab } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { cn } from "~/lib";
import MessageItem from "./MessageItem";
import ErrorPart from "./message/ErrorPart";

interface ChatMessagesProps {
  messages: UIMessage[];
  isSubmitted: boolean;
  isStreaming: boolean;
  isIdle: boolean;
  error?: Error;
}

// Memoized component to prevent unnecessary re-renders
const ChatMessages = memo(function ChatMessages({
  messages,
  error,
  isSubmitted,
  isStreaming,
  isIdle,
}: ChatMessagesProps) {
  // const { messages, branches, isLoading, onBranchPrev, onBranchNext } =
  //   useChatMessages();
  const listRef = useRef<HTMLDivElement>(null);
  const latestAssistantRef = useRef<HTMLDivElement>(null);
  const isPinnedToBottomRef = useRef(true);
  const prevLastAssistantIdRef = useRef<string | undefined>(undefined);
  const hasAutoJumpedThisTurnRef = useRef(false);

  // Observe latest assistant visibility; if it's visible, we treat as "pinned"
  const [bottomRef, bottomEntry] = useIntersectionObserver({
    root: listRef.current ?? undefined,
    threshold: 0.99,
  });

  // Keep the ref flag in sync for auto-follow logic
  useEffect(() => {
    isPinnedToBottomRef.current = !!bottomEntry?.isIntersecting;
  }, [bottomEntry]);

  // Scroll to bottom helper
  const scrollToBottom = useCallback(
    (mode: "instant" | "smooth" = "instant") => {
      const el = listRef.current;
      if (!el) return;
      if (mode === "instant") {
        el.scrollTop = el.scrollHeight;
      } else {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      }
    },
    [],
  );

  // Always scroll when new messages are appended.
  // While streaming, keep following the output only if user stayed at bottom.
  // While streaming/submitted, follow only when pinned
  useEffect(() => {
    if (!(isStreaming || isSubmitted)) return;
    if (!isPinnedToBottomRef.current) return;
    const raf = requestAnimationFrame(() => scrollToBottom("instant"));
    return () => cancelAnimationFrame(raf);
  }, [isStreaming, isSubmitted, scrollToBottom]);

  // On submit start: jump once to bring the assistant area into view (no locking)
  useEffect(() => {
    if (isSubmitted && !hasAutoJumpedThisTurnRef.current) {
      hasAutoJumpedThisTurnRef.current = true;
      scrollToBottom("instant");
    }
    if (isIdle) {
      hasAutoJumpedThisTurnRef.current = false;
    }
  }, [isSubmitted, isIdle, scrollToBottom]);

  const messageCount = useMemo(() => messages.length, [messages]);

  // When a new assistant message appears, smoothly reveal it if pinned
  const lastAssistantIndex = useMemo(() => {
    for (let i = messageCount - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return i;
    }
    return -1;
  }, [messageCount, messages]);

  useEffect(() => {
    const currentId =
      lastAssistantIndex >= 0
        ? (messages[lastAssistantIndex].id as string)
        : undefined;
    const prevId = prevLastAssistantIdRef.current;
    const appendedAssistant = currentId && currentId !== prevId;
    if (appendedAssistant && isPinnedToBottomRef.current) {
      scrollToBottom("smooth");
    }
    prevLastAssistantIdRef.current = currentId;
  }, [lastAssistantIndex, messages, scrollToBottom]);

  console.log("Rerender Chat Messages");

  return (
    <Box
      ref={listRef}
      className={cn(
        messageCount > 0 ? "overflow-y-auto" : "overflow-y-hidden",
        "flex-1 overflow-x-hidden px-1 sm:px-3 py-2 sm:py-3",
        "h-full scroll-smooth",
        // For sticky FAB positioning within the scroll container
        "relative",
        // Custom scrollbar styles
        "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400",
      )}
      style={{
        // Fallback for browsers that don't support scrollbar-* classes
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(156, 163, 175, 0.5) transparent",
      }}
    >
      <div className="space-y-3 sm:space-y-4 min-h-full">
        {messages.map((m, idx) => (
          <MessageItem
            key={m.id}
            ref={idx === lastAssistantIndex ? latestAssistantRef : undefined}
            message={m}
          />
        ))}

        {
          // Fallback to generic MessagePart to cover additional types (e.g., errors)
          error && <ErrorPart errorText={error.message} />
        }

        {isSubmitted && (
          <Box className="flex items-center gap-2 px-3 py-2 text-gray-500">
            <CircularProgress
              size={16}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400"
            />
            <Typography variant="body2" className="text-sm">
              Model is thinking…
            </Typography>
          </Box>
        )}

        {/* Bottom sentinel to detect if viewport is at the present */}
        <div ref={bottomRef} />
        {/* Extra bottom gap to clear the input */}
        <div className="h-20 sm:h-24" />
      </div>

      {/* Floating action button: jump to present when not pinned */}
      {!bottomEntry?.isIntersecting && (
        <Box
          className={cn(
            // Sticky to the bottom of this scroll container viewport
            "sticky bottom-0",
            // Right-align within the container
            "flex justify-end",
          )}
          sx={{ pointerEvents: "none" }}
        >
          <Fab
            size="medium"
            color="secondary"
            aria-label="Jump to present"
            onClick={() => scrollToBottom("smooth")}
            sx={{ pointerEvents: "auto", boxShadow: 3 }}
          >
            <KeyboardArrowDownIcon />
          </Fab>
        </Box>
      )}
    </Box>
  );
});

export default ChatMessages;
