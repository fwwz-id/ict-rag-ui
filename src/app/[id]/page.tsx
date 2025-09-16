import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import ChatApp from "~/components/ChatApp";

import TopActions from "~/components/TopActions";

import { getDefaultCookies } from "~/cookie/helper";

export default async function Page({ params }: { params: { id: string } }) {
  const defaults = await getDefaultCookies();
  const chatId = (await params).id;

  return (
    <main className="min-h-screen flex flex-col">
      {/* Mobile-first AppBar with improved responsive design */}
      <AppBar
        position="fixed"
        className="bg-pink-200/30 shadow-none backdrop-blur-md z-50"
      >
        <Toolbar className="min-h-[56px] px-2 sm:px-4">
          <Container maxWidth="lg" className="px-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Typography
                  variant="h6"
                  className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800"
                >
                  KDEI Chatbot
                </Typography>
                <div className="flex items-center gap-1 px-2 py-1 bg-pink-100 rounded-full border border-pink-300">
                  <span className="text-xs font-medium text-orange-600">
                    v0.1.0-beta
                  </span>
                </div>
              </div>

              <TopActions />
            </div>
          </Container>
        </Toolbar>
      </AppBar>

      {/* Main content area with mobile-first spacing */}
      <div className="flex-1 pt-12 sm:pt-16 relative">
        {/* Background title - hidden on small screens, visible on larger ones */}
        <Typography
          variant="h1"
          className="font-bold text-white/30 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl sm:text-6xl lg:text-8xl xl:text-9xl pointer-events-none select-none z-0 hidden sm:block leading-[0.9] text-center whitespace-nowrap"
        >
          KDEI <br /> HOTLINE
        </Typography>

        {/* Chat container with mobile-optimized padding */}
        <Container
          maxWidth="lg"
          className="relative z-10 h-full px-2 sm:px-4 py-4 sm:py-6"
        >
          <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
            <ChatApp defaults={defaults} chatId={chatId} />
          </div>
        </Container>
      </div>
    </main>
  );
}
