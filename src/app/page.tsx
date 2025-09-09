import { Fragment } from "react";

import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";

import FormDialogTrigger from "~/components/form-dialog/trigger";
import FormDialog from "~/components/form-dialog/dialog";
import ChatInput from "~/components/chat-input";
import ChatBubble from "~/components/chat-bubble";

import { RootContextProvider } from "~/context/root-context";
import { MARKDOWN_CHATS } from "~/chats";

export default function Page() {
  return (
    <RootContextProvider>
      <main className="min-h-screen">
        <AppBar
          position="fixed"
          className="pr-0! bg-pink-200/50 shadow-none backdrop-blur-md"
        >
          <Toolbar className="max-w-6xl left-1/2 w-full -translate-x-1/2 my-2 text-primary">
            <Typography variant="h6" flexGrow={1}>
              KDEI Taipei Hotline
            </Typography>
            <div>
              <Button>Clear</Button>
              <FormDialogTrigger />
              <FormDialog />
            </div>
          </Toolbar>
        </AppBar>

        <section className="min-h-screen flex flex-col justify-end items-center relative">
          <Typography
            variant="h1"
            fontWeight={700}
            className="text-white/50 fixed top-1/2 left-1/2 -translate-1/2"
          >
            KDEI <br /> HOTLINE
          </Typography>

          <div className="relative max-w-6xl w-full mb-4 mt-30">
            <Stack className="space-y-2">
              {MARKDOWN_CHATS.map((chat, id) => (
                // Render client then agent for each conversation pair
                <Fragment key={id}>
                  <ChatBubble content={chat.client} />
                  <ChatBubble agent content={chat.agent} />
                </Fragment>
              ))}
            </Stack>
          </div>

          <Paper className="relative max-w-6xl w-full mb-4">
            <ChatInput />
          </Paper>
        </section>
      </main>
    </RootContextProvider>
  );
}
