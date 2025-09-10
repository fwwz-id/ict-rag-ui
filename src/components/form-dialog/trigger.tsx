"use client";

import IconButton from "@mui/material/IconButton";
import SettingsIcon from "@mui/icons-material/Settings";
import Tooltip from "@mui/material/Tooltip";

import { useFormDialogContext } from "~/context/form-dialog-context";

export default function FormDialogTrigger() {
  const { toggleFormDialog } = useFormDialogContext();

  return (
    <Tooltip title="Config AI">
      <IconButton color="primary" onClick={toggleFormDialog}>
        <SettingsIcon />
      </IconButton>
    </Tooltip>
  );
}
