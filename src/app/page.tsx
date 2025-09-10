import AppBar from "@mui/material/AppBar";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";

import FormDialogTrigger from "~/components/form-dialog/trigger";
import FormDialog from "~/components/form-dialog/dialog";
import ChatInput from "~/components/chat-input/chat-input";

import ChatBubbles from "~/components/chat-bubbles";

import { FormDialogContextProvider } from "~/context/form-dialog-context";
import { getDefaultCookies } from "~/cookie/helper";
import { ConversationContextProvider } from "~/context/conversation-context";
import ClearChatButton from "~/components/clear-chat-button";

export default async function Page() {
  const config = await getDefaultCookies();

  return (
    <FormDialogContextProvider>
      <ConversationContextProvider>
        <main className="min-h-screen">
          <AppBar
            position="fixed"
            className="pr-0! bg-pink-200/50 shadow-none backdrop-blur-md"
          >
            <Toolbar className="max-w-6xl left-1/2 w-full -translate-x-1/2 my-2 text-primary">
              <Typography
                variant="h6"
                flexGrow={1}
                className="text-lg lg:text-xl"
              >
                KDEI Taipei Hotline
              </Typography>
              <div className="space-x-1">
                <ClearChatButton />
                <FormDialogTrigger />
                <FormDialog config={config} />
              </div>
            </Toolbar>
          </AppBar>

          <section className="min-h-screen flex flex-col justify-end items-center relative pb-24">
            <Typography
              variant="h1"
              fontWeight={700}
              className="text-white/50 fixed top-1/2 left-1/2 -translate-1/2 text-6xl lg:text-9xl"
            >
              KDEI <br /> HOTLINE
            </Typography>

            <div className="relative max-w-6xl w-full mb-4 mt-30">
              <ChatBubbles />
            </div>

            <Paper className="fixed bottom-6 max-w-6xl w-full">
              <ChatInput />
            </Paper>
          </section>
        </main>
      </ConversationContextProvider>
    </FormDialogContextProvider>
  );
}
