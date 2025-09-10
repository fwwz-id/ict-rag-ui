"use client";

import { Fragment, useState } from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import DeleteIcon from "@mui/icons-material/Delete";
import { useConversation } from "~/context/conversation-context";

export default function ClearChatButton() {
  const [open, setOpen] = useState(false);
  const { wipeConversations } = useConversation();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose =
    (wipe: boolean = false) =>
    () => {
      if (wipe) wipeConversations();

      setOpen(false);
    };

  return (
    <Fragment>
      <Tooltip title="Delete">
        <IconButton color="primary" onClick={handleClickOpen}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete conversation</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete current session?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose()}>Cancel</Button>
          <Button onClick={handleClose(true)} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}
