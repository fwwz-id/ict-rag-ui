import { memo } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import ClearAllRoundedIcon from "@mui/icons-material/ClearAllRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";

import { useChatToolbar } from "./ChatContext";

interface ChatToolbarProps {
  onRegenerate: () => void;
  onNewChat: () => void;
  onAbort: () => void;
  onClear: () => void;
  hasMessages: boolean;
  isLoading: boolean;
}

// Memoized component to prevent unnecessary re-renders
const ChatToolbar = memo(function ChatToolbar({
  onRegenerate,
  onNewChat,
  onAbort,
  onClear,
  hasMessages,
  isLoading,
}: ChatToolbarProps) {
  const { onShowConfig } = useChatToolbar();

  return (
    <Box className="border-b border-gray-200/50 pb-2 mb-2 px-1 sm:px-2">
      <div className="flex items-center justify-between min-h-[40px] sm:min-h-[48px]">
        {/* Left side - primary actions */}
        <div className="flex items-center gap-2">
          <Tooltip title="Settings" placement="bottom">
            <IconButton color="primary" onClick={onShowConfig} size="small">
              <SettingsRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="New chat" placement="bottom">
            <IconButton color="primary" onClick={onNewChat} size="small">
              <AddCircleRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>

        {/* Right side - message actions */}
        <div className="flex gap-2 overflow-x-auto">
          <Tooltip title="Retry" placement="bottom">
            <span>
              <IconButton
                color="primary"
                onClick={onRegenerate}
                disabled={!hasMessages || isLoading}
                size="small"
              >
                <RestartAltRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip
            title={isLoading ? "Stop" : "Stop (disabled)"}
            placement="bottom"
          >
            <span>
              <IconButton
                color="warning"
                onClick={onAbort}
                disabled={!isLoading}
                size="small"
              >
                <StopRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Clear chat" placement="bottom">
            <span>
              <IconButton
                color="error"
                onClick={onClear}
                disabled={!hasMessages || isLoading}
                size="small"
              >
                <ClearAllRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </div>
      </div>
    </Box>
  );
});

export default ChatToolbar;
