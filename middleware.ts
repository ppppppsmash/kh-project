import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const session = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  const isAuthPage = request.nextUrl.pathname.startsWith("/signin");

  if (isAuthPage) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return null;
  }

  if (!session) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return null;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
