import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function generateChatId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function middleware(request: NextRequest) {
  // If user visits the root path, redirect to a new chat
  if (request.nextUrl.pathname === "/") {
    const chatId = generateChatId();
    return NextResponse.redirect(new URL(`/${chatId}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
