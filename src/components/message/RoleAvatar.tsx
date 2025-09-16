import { Avatar } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { cn } from "~/lib";

interface RoleAvatarProps {
  role: string;
}

export default function RoleAvatar({ role }: RoleAvatarProps) {
  const isUser = role === "user";
  return (
    <Avatar
      className={cn(
        "w-8 h-8 text-white text-sm font-medium",
        isUser ? "bg-primary" : "bg-gray-600",
      )}
    >
      {isUser ? (
        <AccountCircleIcon fontSize="small" />
      ) : (
        <SmartToyIcon fontSize="small" />
      )}
    </Avatar>
  );
}
