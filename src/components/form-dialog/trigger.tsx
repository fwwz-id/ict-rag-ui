"use client";

import IconButton from "@mui/material/IconButton";
import SettingsIcon from "@mui/icons-material/Settings";

import { useRootContext } from "~/context/root-context";

export default function FormDialogTrigger() {
  const { toggleFormDialog } = useRootContext();

  return (
    <IconButton color="primary" onClick={toggleFormDialog}>
      <SettingsIcon />
    </IconButton>
  );
}
